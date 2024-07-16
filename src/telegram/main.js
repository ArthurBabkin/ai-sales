const { Telegraf, Markup } = require("telegraf");
const { initializeApp } = require("firebase/app");
const { getDatabase, onValue, ref } = require("firebase/database");
const { START_MESSAGE } = require("./constants");
const { TRIGGERS_DB } = require("../bot/constants");
const { getUserId } = require("../bot/database");
const { updateUser } = require("../admin-panel/database");
const {
	getGroups,
	addGroup,
	removeGroup,
	clearTriggers,
	getServices,
	addService,
	resetServices,
	addOngoingService,
	removeOngoingService,
	getServedUser,
	checkOngoingService,
} = require("./database");

const bot = new Telegraf(process.env.TELEGRAM_TOKEN);

const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	databaseURL: process.env.DATABASE_URL,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

/**
 * Sends the START_MESSAGE as a reply in the context.
 *
 * @param {Context} ctx - The context object.
 * @return {Promise<void>} A Promise that resolves after sending the message.
 */
const start = async (ctx) => {
	await ctx.reply(START_MESSAGE);
};

bot.command("start", start);
bot.command("help", start);

bot.command("set_group", async (ctx) => {
	const code = await addGroup(ctx.update.message.chat.id, database);
	if (code === 0) {
		await ctx.reply("Group added");
	} else {
		await ctx.reply("Error adding group");
	}
});

bot.command("unset_group", async (ctx) => {
	const code = await removeGroup(ctx.update.message.chat.id, database);
	if (code === 0) {
		await ctx.reply("Group removed");
	} else {
		await ctx.reply("Error removing group");
	}
});

bot.command("leader_board", async (ctx) => {
	const services = await getServices(database);
	if (Object.entries(services).length === 0) {
		await ctx.reply("No services registered yet 🤷‍♀️");
	} else {
		message = "Leader board 🧐:\n";
		for (const [key, value] of Object.entries(services)) {
			message += `@${key}: ${value.length} clients served 🤪\n`;
		}
		await ctx.reply(message);
	}
});

bot.command("reset_leader_board", async (ctx) => {
	const code = await resetServices(database);
	if (code === 0) {
		await ctx.reply("Leader board reset 🫠");
	} else {
		await ctx.reply("Error resetting leader board 🤯");
	}
});

bot.command("finish", async (ctx) => {
	const description = ctx.update.message.text.replace("/finish", "").trim();
	const username = ctx.from.username;
	if (!await checkOngoingService(database, username)) {
		await ctx.reply("You don't have ongoing services 🧙");
		return;
	}
	const userId = await getServedUser(database, username);
	if (description.length > 0) {
		await updateUser(userId, description, database);
	}
	Promise.all([
		removeOngoingService(database, username),
		addService(database, username, userId),
	]);
	await ctx.reply("Congratulations on successful service! 🎉");
});

bot.action(/pick:(.+)/, async (ctx) => {
	const username = ctx.from.username;
	if (await checkOngoingService(database, username)) {
		console.log("How am I here?");
		await ctx.answerCbQuery("You already have an ongoing service");
		return;
	}
	const userId = ctx.match[1];
	ctx.answerCbQuery();
	const message = `@${username} 🥞\nYou picked a client with ID +${userId}. ⛳️\nTo complete service and receive points, \n1) Go to https://wa.me/+${userId} or call +${userId} 🍄\n2) Once you're done, click below and follow instructions ⬇️⬇️⬇️`;
	const keyboard = Markup.inlineKeyboard([
		Markup.button.callback("Done ✅", `done:${userId}:${username}`),
	]);
	await addOngoingService(database, username, userId);
	await ctx.editMessageText(message, keyboard);
});

bot.action(/done:(.+):(.+)/, async (ctx) => {
	const userId = ctx.match[1];
	const username = ctx.match[2];
	if (!checkOngoingService(database, username, userId)) {
		ctx.answerCbQuery("You don't serve this client");
		return;
	}
	ctx.answerCbQuery();
	const message = `@${username} We are almost done! 😺\n To finish serving this client, type /finish 🤠\nYou can optionally specify some additional information on this user right after command 👥`
	await ctx.editMessageText(message)
});

const dbRef = ref(database, TRIGGERS_DB);
onValue(dbRef, async (snapshot) => {
	const triggers = snapshot.val();
	await clearTriggers(database);
	const groupIds = await getGroups(database);
	if (!triggers || !groupIds) {
		return;
	}
	for (let i = 0; i < groupIds.length; i++) {
		const groupId = groupIds[i];
		for (let j = 0; j < triggers.length; j++) {
			const trigger = triggers[j];
			try {
				const userId = getUserId(trigger.userId);
				await bot.telegram.sendMessage(
					groupId,
					`🦅 Trigger activated! 😱\n🙈 Trigger: ${trigger.trigger} 🙃\n🐳 User: ${userId} 🌞`,
					Markup.inlineKeyboard([
						Markup.button.callback("Pick ✅", `pick:${userId}`),
					]),
				);
			} catch (error) {
				console.error("Error sending message:", error);
			}
		}
	}
});

bot.launch();
