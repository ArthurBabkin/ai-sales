const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;

const REMINDER_LIMIT = 10 * 60 * 1000;
const TOP_K_PRODUCTS = 3;

const CHATS_DB = "chats/";
const PRODUCTS_DB = "products/";
const TRIGGERS_DB = "triggers/";
const INTENTS_DB = "intents/";
const SYSTEM_PROMPT_DB = "systemPrompt/";
const CLASSIFIER_PROMPT_DB = "classifierPrompt/";
const REMINDER_PROMPT_DB = "reminderPrompt/";


const INDEX_NAME = "ai-sales";
const VECTOR_DB_NAMESPACE = "products";

module.exports = {
	RESET_MESSAGE,
	HELP_MESSAGE,
	CLASSIFIER_MESSAGE,
	REMINDER_MESSAGE,
	REMINDER_LIMIT,
	TOP_K_PRODUCTS,
	CHATS_DB,
	PRODUCTS_DB,
	TRIGGERS_DB,
	INTENTS_DB,
	SYSTEM_PROMPT_DB,
	CLASSIFIER_PROMPT_DB,
	REMINDER_PROMPT_DB,
	INDEX_NAME,
	VECTOR_DB_NAMESPACE,
};
