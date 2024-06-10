const WhatsAppBot = require("@green-api/whatsapp-bot");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { get_llm_response } = require("./api");
const { HELP_MESSAGE, RESET_MESSAGE, SYSTEM_MESSAGE } = require("./constants");
const {
  resetUser,
  getMessages,
  addMessage,
  getProducts,
  addBuyer,
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

function squeezeMessages(
  messages,
  maxSequenceLength = 30,
  maxMessageLength = 500
) {
  messages = messages.slice(-maxSequenceLength);
  for (i = 0; i < messages.length; i++) {
    content = messages[i]["content"];
    if (content.length > maxMessageLength) {
      messages[i]["content"] =
        content.substring(content.length - maxMessageLength) + "...";
    }
  }
  return messages;
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
  const messages = await getMessages(database, userId);
  try {
    const products = await getProducts(database);
    const response = await get_llm_response(
      squeezeMessages(messages),
      process.env.LLM_URL,
      process.env.DEEPSEEK_TOKEN,
      "deepseek-chat",
      SYSTEM_MESSAGE + "\n" + JSON.stringify(products)
    );

    message = response;
    await addMessage(database, userId, {
      role: "assistant",
      content: message,
    });

    if (message === "SELL") {
      message = "Trigger activated";
      await addBuyer(database, userId);
    }

    await ctx.reply(message);
  } catch (error) {
    console.error(error);

    await addMessage(database, userId, {
      role: "assistant",
      content: "Sorry, an error occurred",
    });

    await ctx.reply("Sorry, an error occurred");
  }
});

bot.launch();
