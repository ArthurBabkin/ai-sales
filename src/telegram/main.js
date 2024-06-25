const { Telegraf } = require("telegraf");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { START_MESSAGE } = require("./constants");
const { getGroups, addGroup, removeGroup } = require("./database");

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

const start = async (ctx) => {
  console.log(START_MESSAGE);
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

bot.launch();


