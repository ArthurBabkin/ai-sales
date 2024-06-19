const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;
const SYSTEM_MESSAGE = `You are sales assistant.
Your goal is to guide potential buyers through the products listed below in JSON format.
Be polite, not intrusive, Do not mention that you are AI. \
Do not assist with anything not related to purchase. \
Try to behave like a real person, build concise and brief responses. \
List of products:`;
const CLASSIFIER_SYSTEM_MESSAGE = `During the conversation, behave like a \
real person. Construct your responses in a vivid way, try to be brief and concise.`
const CLASSIFIER_MESSAGE = `You will be provided with a chat history \
of user and sales assistant. Based on this, determine, \
does user want to buy the product. Your answer must be just one word: YES or NO. \
If you cannot be sure 100%, answer NO.`
const CHATS_DB = "chats/";
const PRODUCTS_DB = "products/";
const TRIGGERS_DB = "triggers/"
const INTENTS_DB = "intents/"

module.exports = {
  RESET_MESSAGE,
  HELP_MESSAGE,
  SYSTEM_MESSAGE,
  CLASSIFIER_MESSAGE,
  CLASSIFIER_SYSTEM_MESSAGE,
  CHATS_DB,
  PRODUCTS_DB,
  TRIGGERS_DB,
  INTENTS_DB
};
