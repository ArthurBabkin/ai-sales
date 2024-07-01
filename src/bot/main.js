const WhatsAppBot = require("@green-api/whatsapp-bot");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const axios = require("axios");
const { getGeminiResponse, getUserIntent } = require("./api");
const {
	HELP_MESSAGE,
	RESET_MESSAGE,
	CLASSIFIER_MESSAGE,
	FORGOTTEN_CHAT_MESSAGE,
} = require("./constants");
const {
	resetUser,
	getMessages,
	addMessage,
	getProducts,
	addTrigger,
	getIntents,
	getSystemPrompt,
	getForgottenChats,
} = require("./database");

const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	databaseURL: process.env.DATABASE_URL,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
};

app = initializeApp(firebaseConfig);
database = getDatabase(app);

/**
 * Squeezes messages by truncating sequences and long messages to a specified length.
 *
 * @param {Array} messages - The array of messages to squeeze.
 * @param {number} maxSequenceLength - The maximum number of messages to keep.
 * @param {number} maxMessageLength - The maximum length of a message before truncation.
 * @return {Array} The squeezed array of messages.
 */
function squeezeMessages(
	messages,
	maxSequenceLength = 30,
	maxMessageLength = 500,
) {
	newMessages = messages.slice(-maxSequenceLength);
	for (i = 0; i < newMessages.length; i++) {
		content = newMessages[i].content;
		if (content.length > maxMessageLength) {
			newMessages[i].content =
				`${content.substring(content.length - maxMessageLength)}...`;
		}
	}
	return newMessages;
}

/**
 * Checks if the given message and intent response contain certain keywords and returns the corresponding intent.
 *
 * @param {string} messageResponse - The response to the message.
 * @param {string} intentResponse - The response to the intent.
 * @param {Array<Object>} intents - An array of intents.
 * @return {string|null} The found intent or null if no intent is found.
 */
function checkTrigger(messageResponse, intentResponse, intents) {
	if (
		messageResponse.toLowerCase().includes("thank") &&
		messageResponse.toLowerCase().includes("purchase")
	) {
		return "purchase";
	}

	foundIntent = null;
	for (let i = 0; i < intents.length; i++) {
		const intent = intents[i];
		if (intentResponse.toLowerCase().includes(intent.name.toLowerCase())) {
			foundIntent = intent.name;
			break;
		}
	}

	return foundIntent;
}

/**
 * Asynchronously sends reminders to users based on forgotten chats.
 *
 * @param {Object} database - The database object to retrieve information from.
 * @return {Promise<void>} A promise that resolves once all reminders are sent.
 */
async function reminder(database) {
	const users = await getForgottenChats(database);
	const systemPrompt = await getSystemPrompt(database);
	const products = await getProducts(database);
	for (const user in users) {
		const messages = users[user].messages;
		messages.push({ role: "user", content: FORGOTTEN_CHAT_MESSAGE });
		const message = await getGeminiResponse(
			messages,
			process.env.GEMINI_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
			`${systemPrompt}\nProducts:\n${JSON.stringify(products)}`,
		);
		const userId = `${user}@c.us`;
		const url = `https://1103.api.green-api.com/waInstance${process.env.ID_INSTANCE}/sendMessage/${process.env.API_TOKEN_INSTANCE}`;
		const payload = {
			chatId: userId,
			message: message,
		};
		const headers = {
			"Content-Type": "application/json",
		};
		await axios.post(url, payload, { headers: headers });
		await addMessage(database, userId, {
			role: "user",
			content: FORGOTTEN_CHAT_MESSAGE,
		});
		await addMessage(
			database,
			userId,
			{
				role: "assistant",
				content: message,
			},
			true,
		);
	}
}

const bot = new WhatsAppBot({
	idInstance: process.env.ID_INSTANCE,
	apiTokenInstance: process.env.API_TOKEN_INSTANCE,
});

bot.command("reset", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	await resetUser(database, userId);
	await ctx.reply(RESET_MESSAGE);
});

bot.command("start", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	await resetUser(database, userId, [
		{ role: "assistant", content: HELP_MESSAGE },
	]);
	await ctx.reply(HELP_MESSAGE);
});

bot.command("help", async (ctx) => {
	await ctx.reply(HELP_MESSAGE);
});

bot.on("message", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	await addMessage(database, userId, {
		role: "user",
		content: ctx.update.message.text,
	});
	messages = await getMessages(database, userId);
	messages = squeezeMessages(messages);
	try {
		const systemPrompt = await getSystemPrompt(database);
		const products = await getProducts(database);
		const intents = await getIntents(database);
		const intent = await getUserIntent(
			messages,
			intents,
			CLASSIFIER_MESSAGE,
			process.env.GEMINI_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
		);

		const message = await getGeminiResponse(
			messages,
			process.env.GEMINI_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
			`${systemPrompt}\nProducts:\n${JSON.stringify(products)}`,
		);

		const trigger = checkTrigger(message, intent, intents);
		if (trigger != null) {
			await addTrigger(database, userId, trigger);
			await resetUser(database, userId);
			await ctx.reply("TRIGGER ACTIVATED");
			return;
		}

		await addMessage(database, userId, {
			role: "assistant",
			content: message,
		});

		await ctx.reply(message);
	} catch (error) {
		console.error("Error getting response:", error);

		await addMessage(database, userId, {
			role: "assistant",
			content: "Sorry, an error occurred",
		});

		await ctx.reply("Sorry, an error occurred");
	}
});

setInterval(() => reminder(database), 60 * 1000);

bot.launch();
