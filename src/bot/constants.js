const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;
const SYSTEM_MESSAGE = `This is a system message. You are sales assistant. \
Your goal is to guide potential buyers through the products listed below in JSON format. \
Be polite, not intrusive, ask for confirmation when user wants to buy. \
Do not mention that you are AI. Do not assist with anything not related to purchase. \
List of products:`;
const CLASSIFIER_MESSAGE = `Consider this a system message. Your task is to classify \
the dialogue. You will be provided with a chat history and intent list. \
Carefully examine chat history and every intent from below and answer "YES", if \
and only if condition of some intent is fully met. Otherwise, answer "NO".`;
const CHATS_DB = "chats/";
const PRODUCTS_DB = "products/";
const TRIGGERS_DB = "triggers/";
const INTENTS_DB = "intents/";


module.exports = {
  RESET_MESSAGE,
  HELP_MESSAGE,
  SYSTEM_MESSAGE,
  CLASSIFIER_MESSAGE,
  CLASSIFIER_SYSTEM_MESSAGE,
  CHATS_DB,
  PRODUCTS_DB,
  TRIGGERS_DB,
  INTENTS_DB,
};
