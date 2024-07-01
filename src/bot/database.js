const { ref, get, set, child, update } = require("firebase/database");
const {
	CHATS_DB,
	PRODUCTS_DB,
	TRIGGERS_DB,
	INTENTS_DB,
	SYSTEM_PROMPT_DB,
	FORGOTTEN_CHAT_LIMIT,
} = require("./constants");

/**
 * Validates the userId based on the regex pattern and returns a sanitized version if needed.
 *
 * @param {string} userId - The user ID to validate and sanitize
 * @return {string} The sanitized user ID
 */
function getUserId(userId) {
	const regex = /^[A-Za-z0-9]+$/;
	if (!regex.test(userId)) {
		const index = userId.search(/[^A-Za-z0-9]/);
		if (index !== -1) {
			return userId.substring(0, index);
		}
	}
	return userId;
}

/**
 * Resets the user's chat history in the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @param {string} userId - The ID of the user.
 * @param {Array} [messages=[]] - The new chat messages to be set. Defaults to an empty array.
 * @return {Promise<void>} - A promise that resolves when the user's chat history is reset.
 */
async function resetUser(database, userId, messages = []) {
	dbRef = ref(database);
	try {
		await set(child(dbRef, CHATS_DB + getUserId(userId)), {
			messages: messages,
		});
	} catch (error) {
		console.error("Error resetting user:", error);
	}
}

/**
 * Retrieves messages for a specific user from the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @param {string} userId - The ID of the user.
 * @return {Array} An array of messages for the user, or an empty array if no messages are found.
 */
async function getMessages(database, userId) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, CHATS_DB + getUserId(userId)));
		if (snapshot.exists()) {
			return snapshot.val().messages || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching messages:", error);
		return [];
	}
}

/**
 * Adds a message to the database for a specific user, optionally setting a reminder.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @param {string} userId - The ID of the user.
 * @param {string} message - The message to add.
 * @param {boolean} [reminder=false] - Flag indicating if the message is a reminder.
 */
async function addMessage(database, userId, message, reminder = false) {
	dbRef = ref(database);
	try {
		messages = await getMessages(database, userId);
		messages.push(message);
		const curTimestamp = Date.now();
		await update(child(dbRef, CHATS_DB + getUserId(userId)), {
			messages: messages,
			lastUpdate: curTimestamp,
			reminderLast: reminder,
		});
	} catch (error) {
		console.error("Error adding a message:", error);
	}
}

/**
 * Retrieves the products from the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Array<Object>>} - A promise that resolves to an array of products.
 */
async function getProducts(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, PRODUCTS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching products:", error);
		return [];
	}
}

/**
 * Retrieves the triggers from the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Array<Object>>} - A promise that resolves to an array of triggers.
 */
async function getTriggers(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, TRIGGERS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching buyers:", error);
		return [];
	}
}

/**
 * Adds a trigger to the database for a specific user.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @param {string} userId - The user ID for whom the trigger is being added.
 * @param {string} trigger - The trigger to be added.
 */
async function addTrigger(database, userId, trigger) {
	dbRef = ref(database);
	try {
		buyers = await getTriggers(database);
		buyers.push({ userId: userId, trigger: trigger });
		await update(dbRef, { [TRIGGERS_DB]: buyers });
	} catch (error) {
		console.error("Error adding trigger:", error);
	}
}

/**
 * Retrieves the intents from the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Array>} A promise that resolves to an array of intents.
 */
async function getIntents(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, INTENTS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching buyers:", error);
		return [];
	}
}

/**
 * Retrieves the system prompt from the given Firebase Realtime Database instance.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<string>} A promise that resolves to the system prompt, or an empty string if it does not exist.
 */
async function getSystemPrompt(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, SYSTEM_PROMPT_DB));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching system prompt:", error);
		return "";
	}
}

/**
 * Retrieves the forgotten chats from the given Firebase Realtime Database instance.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Object>} A promise that resolves to an object containing the forgotten chats,
 * where the keys are the chat IDs and the values are the chat objects. Returns an empty object if
 * no forgotten chats are found.
 * @throws {Error} If there is an error retrieving the chats from the database.
 */
async function getForgottenChats(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, CHATS_DB));
		if (snapshot.exists()) {
			const chats = snapshot.val() || {};
			forgottenChats = {};
			const curTimestamp = Date.now();
			for (const chatId in chats) {
				const chat = chats[chatId];
				if (
					chat.lastUpdate < curTimestamp - FORGOTTEN_CHAT_LIMIT &&
					!chat.reminderLast
				) {
					forgottenChats[chatId] = chat;
				}
			}
			return forgottenChats;
		}
		return {};
	} catch (error) {
		console.error("Error getting chats:", error);
		return [];
	}
}

module.exports = {
	getUserId,
	resetUser,
	getMessages,
	addMessage,
	getProducts,
	getTriggers,
	addTrigger,
	getIntents,
	getSystemPrompt,
	getForgottenChats,
};
