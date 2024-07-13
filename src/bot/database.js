const { ref, get, set, child, update } = require("firebase/database");
const axios = require("axios");
const {
	CHATS_DB,
	ITEMS_DB,
	TRIGGERS_DB,
	INTENTS_DB,
	SYSTEM_PROMPT_DB,
	CLASSIFIER_PROMPT_DB,
	REMINDER_PROMPT_DB,
	SETTINGS_DB,
	USERS_DB,
	VECTOR_DB_NAMESPACE,
} = require("./constants");
const { getUserId } = require("./utils");
const { getGeminiResponse, getEmbedding } = require("./api");

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
 * Retrieves the items from the database.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Array<Object>>} - A promise that resolves to an array of items.
 */
async function getItems(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, ITEMS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching items:", error);
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

async function getUsers(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, USERS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || {};
		}
		return {};
	} catch (error) {
		console.error("Error fetching users:", error);
		return {};
	}
}

async function getUser(database, userId) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${USERS_DB}/${userId}`));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return {};
	} catch (error) {
		console.error("Error fetching user:", error);
		return {};
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
 * Retrieves the classifier prompt from the given Firebase Realtime Database instance.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<string>} A promise that resolves to the classifier prompt value.
 */
async function getClassifierPrompt(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, CLASSIFIER_PROMPT_DB));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching classifier prompt:", error);
		return "";
	}
}

/**
 * Retrieves the reminder prompt from the given Firebase Realtime Database instance.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<string>} A promise that resolves to the reminder prompt, or an empty string if it does not exist.
 */
async function getReminderPrompt(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, REMINDER_PROMPT_DB));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching reminder prompt:", error);
		return "";
	}
}

/**
 * Retrieves the settings from the given Firebase Realtime Database instance.
 *
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {Promise<Object>} A promise that resolves to an object containing the settings.
 * If the settings do not exist, an empty object is returned.
 */
async function getSettings(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, SETTINGS_DB));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return {};
	} catch (error) {
		console.error("Error fetching settings:", error);
		return {};
	}
}

async function getReminderActivationTime(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(
			child(dbRef, `${SETTINGS_DB}/reminderActivationTime`),
		);
		if (snapshot.exists()) {
			return Number.parseInt(snapshot.val());
		}
		return 0;
	} catch (error) {
		console.error("Error fetching reminder activation time:", error);
		return 0;
	}
}

async function getResponseDelay(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/responseDelay`));
		if (snapshot.exists()) {
			return Number.parseFloat(snapshot.val());
		}
		return 0;
	} catch (error) {
		console.error("Error fetching response delay:", error);
		return 0;
	}
}

async function getStartMessage(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/startMessage`));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching start message:", error);
		return "";
	}
}

async function getHelpMessage(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/helpMessage`));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching help message:", error);
		return "";
	}
}

async function getResetMessage(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/resetMessage`));
		if (snapshot.exists()) {
			return snapshot.val();
		}
		return "";
	} catch (error) {
		console.error("Error fetching reset message:", error);
		return "";
	}
}

async function getTopKItems(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/topKItems`));
		if (snapshot.exists()) {
			return Number.parseInt(snapshot.val());
		}
		return 0;
	} catch (error) {
		console.error("Error fetching top K items:", error);
		return 0;
	}
}

async function getThreshold(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, `${SETTINGS_DB}/threshold`));
		if (snapshot.exists()) {
			return Number.parseFloat(snapshot.val());
		}
		return 0;
	} catch (error) {
		console.error("Error fetching threshold:", error);
		return 0;
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
async function getForgottenChats(database, reminderTimeout) {
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
					chat.lastUpdate < curTimestamp - reminderTimeout &&
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

/**
 * Retrieves top K items based on the provided message and index.
 *
 * @param {string} message - The message to retrieve items for.
 * @param {object} index - The index to use for querying items.
 * @return {string} A JSON string representing the query response.
 */
async function getKItems(message, topKItems, threshold, index) {
	model = process.env.EMBEDDING_MODEL;
	token = process.env.GEMINI_TOKEN;
	proxy = process.env.PROXY_URL;
	embedding = await getEmbedding(message, model, token, proxy);

	const queryResponse = await index.namespace(VECTOR_DB_NAMESPACE).query({
		vector: embedding,
		topK: topKItems,
		includeMetadata: true,
	});

	items = [];
	for (i = 0; i < queryResponse.matches.length; i++) {
		if (queryResponse.matches[i].score < threshold) {
			continue;
		}
		items.push(queryResponse.matches[i].metadata);
	}

	return items;
}

/**
 * Asynchronously sends reminders to users based on forgotten chats.
 *
 * @param {Object} database - The database object to retrieve information from.
 * @return {Promise<void>} A promise that resolves once all reminders are sent.
 */
async function reminder(database, reminderTimeout) {
	const users = await getForgottenChats(database, reminderTimeout);
	const systemPrompt = await getSystemPrompt(database);
	const items = await getItems(database);
	for (const user in users) {
		const messages = users[user].messages;
		const reminderPrompt = await getReminderPrompt(database);

		messages.push({ role: "user", content: reminderPrompt });

		const message = await getGeminiResponse(
			messages,
			process.env.GEMINI_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
			`${systemPrompt}\Items:\n${JSON.stringify(items)}`,
		);

		if (message === 1) {
			console.error(
				"Error generating reminder message. Proceeding with others",
			);
			continue;
		}

		const userId = `${user}@c.us`;
		const url = `https://1103.api.green-api.com/waInstance${process.env.ID_INSTANCE}/sendMessage/${process.env.API_TOKEN_INSTANCE}`;
		const payload = {
			chatId: userId,
			message: message,
		};
		const headers = {
			"Content-Type": "application/json",
		};

		try {
			await axios.post(url, payload, { headers: headers });
		} catch (error) {
			console.error("Error sending reminder:", error);
			continue;
		}

		await addMessage(database, userId, {
			role: "user",
			content: reminderPrompt,
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

module.exports = {
	getUserId,
	resetUser,
	getMessages,
	addMessage,
	getItems,
	getTriggers,
	addTrigger,
	getIntents,
	getUsers,
	getUser,
	getSystemPrompt,
	getClassifierPrompt,
	getReminderPrompt,
	getSettings,
	getReminderActivationTime,
	getResponseDelay,
	getStartMessage,
	getHelpMessage,
	getResetMessage,
	getTopKItems,
	getThreshold,
	getForgottenChats,
	getKItems,
	reminder,
};
