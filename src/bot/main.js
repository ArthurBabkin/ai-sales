const WhatsAppBot = require("@green-api/whatsapp-bot");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { getGeminiResponse, getUserIntent } = require("./api");
const {
	HELP_MESSAGE,
	RESET_MESSAGE,
	INDEX_NAME,
} = require("./constants");
const {
	resetUser,
	getMessages,
	addMessage,
	addTrigger,
	getIntents,
	getSystemPrompt,
	reminder,
	getKItems,
	getClassifierPrompt,
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
	return new Promise(resolve => setTimeout(resolve, ms));
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
	const userMessage = ctx.update.message.text;
	await addMessage(database, userId, {
		role: "user",
		content: userMessage,
	});
	messages = await getMessages(database, userId);
	messages = squeezeMessages(messages);
	try {
		const [systemPrompt, classifierPrompt, items, intents] =
			await Promise.all([
				getSystemPrompt(database),
				getClassifierPrompt(database),
				getKItems(JSON.stringify(messages), index),
				getIntents(database),
			]);

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
				`${systemPrompt}\nItems:\n${JSON.stringify(items)}`,
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

		await sleep(2000);

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

setInterval(() => reminder(database), 60 * 1000);

bot.launch();
