const WhatsAppBot = require("@green-api/whatsapp-bot");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { getGeminiResponse, getUserIntent } = require("./api");
const {
	HELP_MESSAGE,
	RESET_MESSAGE,
	CLASSIFIER_MESSAGE,
} = require("./constants");
const {
	resetUser,
	getMessages,
	addMessage,
	getProducts,
	addTrigger,
	getIntents,
	getSystemPrompt,
} = require("./database");
const { squeezeMessages, checkTrigger } = require("./utils");

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
