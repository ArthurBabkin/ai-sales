const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;
const SYSTEM_MESSAGE = `You are sales assistant.
Your goal is to guide potential buyers through the products listed below in JSON format.
Be polite, not intrusive, ask for confirmation when user wants to buy.
Do not mention that you are AI. Do not assist with anything not related to purchase.
List of products:`;
const CLASSIFIER_MESSAGE = `You are provided with a list of \
products and a conversation history with client. \
Your task is to classify client's intent given a list of all intents \
with corresponding descriptions. Construct your response in JSON format \
with a single entry {"intent": ...} (e.g {"intent": "NONE"}) with a \
value corresponding to one of the provided. You should pick an \
intent if only you are 100% sure about it, output "NONE" otherwise.`
const CHATS_DB = "chats/";
const PRODUCTS_DB = "products/";
const TRIGGERS_DB = "triggers/"
const INTENTS_DB = "intents/"

module.exports = {
  RESET_MESSAGE,
  HELP_MESSAGE,
  SYSTEM_MESSAGE,
  CLASSIFIER_MESSAGE,
  CHATS_DB,
  PRODUCTS_DB,
  TRIGGERS_DB,
  INTENTS_DB
};
