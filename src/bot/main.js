const WhatsAppBot = require("@green-api/whatsapp-bot");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { getGeminiResponse, getUserIntent } = require("./api");
const { INDEX_NAME } = require("./constants");
const {
	resetUser,
	getMessages,
	addMessage,
	addTrigger,
	getIntents,
	getUserDescription,
	getSystemPrompt,
	reminder,
	getKItems,
	getClassifierPrompt,
	getReminderActivationTime,
	getResponseDelay,
	getStartMessage,
	getHelpMessage,
	getResetMessage,
	getTopKItems,
	getThreshold,
} = require("./database");
const { squeezeMessages, checkTrigger } = require("./utils");
const { Pinecone } = require("@pinecone-database/pinecone");

const pc = new Pinecone({
	apiKey: process.env.PINECONE_TOKEN,
});

const index = pc.index(INDEX_NAME);

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

function sleep(ms) {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

const bot = new WhatsAppBot({
	idInstance: process.env.ID_INSTANCE,
	apiTokenInstance: process.env.API_TOKEN_INSTANCE,
});

bot.command("reset", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	await resetUser(database, userId);
	const resetMessage = await getResetMessage(database);
	await ctx.reply(resetMessage);
});

bot.command("start", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	const startMessage = await getStartMessage(database);
	await resetUser(database, userId, [
		{ role: "assistant", content: startMessage },
	]);
	await ctx.reply(startMessage);
});

bot.command("help", async (ctx) => {
	const helpMessage = await getHelpMessage(database);
	await ctx.reply(helpMessage);
});

bot.on("message", async (ctx) => {
	const userId = ctx.update.message.chat.id;
	const userMessage = ctx.update.message.text;
	await addMessage(database, userId, {
		role: "user",
		content: userMessage,
	});
	const messagesHistory = await getMessages(database, userId);
	const messages = squeezeMessages(messagesHistory);
	try {
		const [topKItems, threshold] = await Promise.all([
			getTopKItems(database),
			getThreshold(database),
		]);
		const [
			systemPrompt,
			classifierPrompt,
			items,
			intents,
			responseDelay,
			userDescription,
		] = await Promise.all([
			getSystemPrompt(database),
			getClassifierPrompt(database),
			getKItems(
				JSON.stringify(squeezeMessages(messagesHistory, 8)),
				topKItems,
				threshold,
				index,
			),
			getIntents(database),
			getResponseDelay(database),
			getUserDescription(database, userId),
		]);

		systemMessages = [`${systemPrompt}\nItems:\n${JSON.stringify(items)}`];
		if (userDescription) {
			systemMessages.push(
				`This is a system message. From now, the chat begins. The user you are going to talk to is already known. Below is the information about him and instructions on how to behave with them:\n${userDescription}`,
			);
		}

		const [intent, message] = await Promise.all([
			getUserIntent(
				messages,
				intents,
				classifierPrompt,
				process.env.GEMINI_MODEL,
				process.env.GEMINI_TOKEN,
				process.env.PROXY_URL,
			),
			getGeminiResponse(
				messages,
				process.env.GEMINI_MODEL,
				process.env.GEMINI_TOKEN,
				process.env.PROXY_URL,
				systemMessages,
			),
		]);

		try {
			const trigger = checkTrigger(intent, intents);
			if (trigger != null) {
				await addTrigger(database, userId, trigger.name);
				await resetUser(database, userId);
				await ctx.reply(trigger.answer);
				return;
			}
		} catch (error) {
			console.log("Error checking trigger:", error);
		}

		await addMessage(database, userId, {
			role: "assistant",
			content: message,
		});

		if (responseDelay > 0) {
			await sleep(responseDelay * 1000);
		}

		await ctx.reply(message);
	} catch (error) {
		console.error("Error building response:", error);

		await addMessage(database, userId, {
			role: "assistant",
			content: "Sorry, an error occurred",
		});

		await ctx.reply("Sorry, an error occurred");
	}
});

getReminderActivationTime(database).then((reminderTimeout) => {
	if (reminderTimeout > 0) {
		setInterval(
			() => reminder(database, reminderTimeout * 60 * 1000),
			20 * 1000,
		);
	}
});

bot.launch();
