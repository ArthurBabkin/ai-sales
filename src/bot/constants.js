const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;

const CLASSIFIER_MESSAGE = `This is a system message.
Your role is to classify the dialogue from below as one of the given intents.
You will be provided with a list of intents in JSON format: [{"INTENT_NAME": "INTENT_DESCRIPTION"}...]. If the dialogue perfectly matches one of the descriptions, respond with that intent name: "INTENT_NAME".
If the dialogue does not perfectly match any of the descriptions (even if it is really close, but not exact), respond with "none".`;

const CHATS_DB = "chats/";
const PRODUCTS_DB = "products/";
const TRIGGERS_DB = "triggers/";
const INTENTS_DB = "intents/";
const SYSTEM_PROMPT_DB = "systemPrompt/";


module.exports = {
  RESET_MESSAGE,
  HELP_MESSAGE,
  CLASSIFIER_MESSAGE,
  CHATS_DB,
  PRODUCTS_DB,
  TRIGGERS_DB,
  INTENTS_DB,
  SYSTEM_PROMPT_DB,
};
