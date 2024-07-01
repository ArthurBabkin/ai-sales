const axios = require("axios");
const { getGeminiResponse } = require("./api");
const {
	getProducts,
	getForgottenChats,
	getSystemPrompt,
	addMessage,
} = require("./database");
const { FORGOTTEN_CHAT_MESSAGE } = require("./constants");

/**
 * Squeezes messages by truncating sequences and long messages to a specified length.
 *
 * @param {Array} messages - The array of messages to squeeze.
 * @param {number} maxSequenceLength - The maximum number of messages to keep.
 * @param {number} maxMessageLength - The maximum length of a message before truncation.
 * @return {Array} The squeezed array of messages.
 */
function squeezeMessages(
	messages,
	maxSequenceLength = 30,
	maxMessageLength = 500,
) {
	newMessages = messages.slice(-maxSequenceLength);
	for (i = 0; i < newMessages.length; i++) {
		content = newMessages[i].content;
		if (content.length > maxMessageLength) {
			newMessages[i].content =
				`${content.substring(content.length - maxMessageLength)}...`;
		}
	}
	return newMessages;
}

/**
 * Checks if the given message and intent response contain certain keywords and returns the corresponding intent.
 *
 * @param {string} messageResponse - The response to the message.
 * @param {string} intentResponse - The response to the intent.
 * @param {Array<Object>} intents - An array of intents.
 * @return {string|null} The found intent or null if no intent is found.
 */
function checkTrigger(messageResponse, intentResponse, intents) {
	if (
		messageResponse.toLowerCase().includes("thank") &&
		messageResponse.toLowerCase().includes("purchase")
	) {
		return "purchase";
	}

	foundIntent = null;
	for (let i = 0; i < intents.length; i++) {
		const intent = intents[i];
		if (intentResponse.toLowerCase().includes(intent.name.toLowerCase())) {
			foundIntent = intent.name;
			break;
		}
	}

	return foundIntent;
}

/**
 * Asynchronously sends reminders to users based on forgotten chats.
 *
 * @param {Object} database - The database object to retrieve information from.
 * @return {Promise<void>} A promise that resolves once all reminders are sent.
 */
async function reminder(database) {
	const users = await getForgottenChats(database);
	const systemPrompt = await getSystemPrompt(database);
	const products = await getProducts(database);
	for (const user in users) {
		const messages = users[user].messages;
		messages.push({ role: "user", content: FORGOTTEN_CHAT_MESSAGE });
		const message = await getGeminiResponse(
			messages,
			process.env.GEMINI_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
			`${systemPrompt}\nProducts:\n${JSON.stringify(products)}`,
		);
		const userId = `${user}@c.us`;
		const url = `https://1103.api.green-api.com/waInstance${process.env.ID_INSTANCE}/sendMessage/${process.env.API_TOKEN_INSTANCE}`;
		const payload = {
			chatId: userId,
			message: message,
		};
		const headers = {
			"Content-Type": "application/json",
		};
		await axios.post(url, payload, { headers: headers });
		await addMessage(database, userId, {
			role: "user",
			content: FORGOTTEN_CHAT_MESSAGE,
		});
		await addMessage(
			database,
			userId,
			{
				role: "assistant",
				content: message,
			},
			true,
		);
	}
}

module.exports = { squeezeMessages, checkTrigger, reminder };
