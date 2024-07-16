const bcrypt = require("bcrypt");
const { ref, update, get, child, set, remove } = require("firebase/database");
const { ADMINS_DB, SESSIONS_DB, SESSION_TIMEOUT } = require("./constants");
const { getEmbedding } = require("../bot/api");
const { getItems, getIntents, getUsers } = require("../bot/database");
const {
	ITEMS_DB,
	INTENTS_DB,
	SYSTEM_PROMPT_DB,
	CLASSIFIER_PROMPT_DB,
	REMINDER_PROMPT_DB,
	SETTINGS_DB,
	USERS_DB,
	VECTOR_DB_NAMESPACE,
} = require("../bot/constants");

/**
 * Adds a new item to the database.
 *
 * @param {string} name - The name of the item.
 * @param {string} description - The description of the item.
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {object} [index=null] - The vector database index.
 * @return {Promise<number>} Returns 0 if the item was added successfully, or 1 if an error occurred.
 */
async function addItem(name, description, database, index = null) {
	dbRef = ref(database);
	try {
		items = await getItems(database);
		id = 0;
		for (i = 0; i < items.length; i++) {
			const item = items[i];
			id = Math.max(id, item.id + 1);
		}
		items.push({
			name: name,
			description: description,
			id: id,
		});
		await update(dbRef, { [ITEMS_DB]: items });
		if (index !== null) {
			await index.namespace(VECTOR_DB_NAMESPACE).upsert([
				{
					id: String(id),
					values: await getEmbedding(
						JSON.stringify(items[i]),
						process.env.EMBEDDING_MODEL,
						process.env.GEMINI_TOKEN,
						process.env.PROXY_URL,
					),
					metadata: {
						name: name,
						description: description,
						id: id,
					},
				},
			]);
		}
		return 0;
	} catch (error) {
		console.error("Error adding new item:", error);
		return 1;
	}
}

/**
 * Updates a item in the database.
 *
 * @param {string} name - The new name of the item.
 * @param {string} description - The new description of the item.
 * @param {number} price - The new price of the item.
 * @param {number} id - The ID of the item to be updated.
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {object} [index=null] - The vector database index.
 * @return {Promise<number>} Returns 0 if the item was updated successfully, or 1 if an error occurred.
 */
async function updateItem(name, description, id, database, index = null) {
	dbRef = ref(database);
	try {
		code = 1;
		items = await getItems(database);
		updatedItem = null;
		for (i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				items[i].name = name;
				items[i].description = description;
				updatedItem = items[i];
				code = 0;
				break;
			}
		}
		await update(dbRef, { [ITEMS_DB]: items });
		if (index != null && updateItem != null) {
			const vector = await getEmbedding(
				JSON.stringify(updatedItem),
				process.env.EMBEDDING_MODEL,
				process.env.GEMINI_TOKEN,
				process.env.PROXY_URL,
			);

			await index.namespace(VECTOR_DB_NAMESPACE).upsert([
				{
					id: String(id),
					values: vector,
					metadata: {
						name: name,
						description: description,
						id: id,
					},
				},
			]);
		}
		return code;
	} catch (error) {
		console.error("Error updating item:", error);
		return 1;
	}
}

/**
 * Deletes an item from the database based on the provided ID.
 *
 * @param {number} id - The ID of the item to be deleted.
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {object} [index=null] - The vector database index.
 * @return {Promise<number>} Returns 0 if the item was deleted successfully, or 1 if an error occurred.
 */
async function deleteItem(id, database, index = null) {
	dbRef = ref(database);
	try {
		code = 1;
		items = await getItems(database);
		newItems = [];
		for (i = 0; i < items.length; i++) {
			if (items[i].id === id) {
				code = 0;
				continue;
			}
			newItems.push(items[i]);
		}
		await update(dbRef, { [ITEMS_DB]: newItems });
		if (index != null) {
			try {
				await index.namespace(VECTOR_DB_NAMESPACE).deleteOne(String(id));
			} catch (error) {
				console.error("Error deleting item from vector database:", error);
			}
		}
		return code;
	} catch (error) {
		console.error("Error deleting item:", error);
		return 1;
	}
}

/**
 * Adds a new intent to the database with the provided name, description, and answer.
 *
 * @param {string} name - The name of the intent to add.
 * @param {string} description - The description of the intent to add.
 * @param {string} answer - The answer associated with the intent.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {number} Returns 0 if the intent was added successfully, or 1 if an error occurred.
 */
async function addIntent(name, description, answer, database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, INTENTS_DB));
		const intents = snapshot.val() || [];
		code = 1;
		newId = 0;
		for (i = 0; i < intents.length; i++) {
			const intent = intents[i];
			newId = Math.max(newId, intent.id + 1);
		}
		intents.push({
			name: name,
			description: description,
			answer: answer,
			id: newId,
		});
		await update(dbRef, { [INTENTS_DB]: intents });
		return 0;
	} catch (error) {
		console.error("Error adding intent:", error);
		return 1;
	}
}

/**
 * Update an intent with the provided name, description, and answer based on the given ID.
 *
 * @param {string} name - The new name for the intent.
 * @param {string} description - The new description for the intent.
 * @param {string} answer - The new answer for the intent.
 * @param {number} id - The ID of the intent to update.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {number} Returns 0 if the intent was updated successfully, or 1 if an error occurred.
 */
async function updateIntent(name, description, answer, id, database) {
	dbRef = ref(database);
	try {
		code = 1;
		intents = await getIntents(database);
		for (i = 0; i < intents.length; i++) {
			if (intents[i].id === id) {
				intents[i].name = name;
				intents[i].description = description;
				intents[i].answer = answer;
				code = 0;
			}
		}
		await update(dbRef, { [INTENTS_DB]: intents });
		return code;
	} catch (error) {
		console.error("Error updating intent:", error);
		return 1;
	}
}

/**
 * Deletes an intent from the database.
 *
 * @param {number} id - The id of the intent to delete.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the intent was deleted successfully, or 1 if an error occurred.
 */
async function deleteIntent(id, database) {
	dbRef = ref(database);
	try {
		code = 1;
		intents = await getIntents(database);
		newIntents = [];
		for (i = 0; i < intents.length; i++) {
			if (intents[i].id === id) {
				code = 0;
				continue;
			}
			newIntents.push(intents[i]);
		}
		await update(dbRef, { [INTENTS_DB]: newIntents });
		return code;
	} catch (error) {
		console.error("Error deleting intent:", error);
		return 1;
	}
}

/**
 * Checks if the given username and password match any admin credentials in the database.
 *
 * @param {string} username - The username to check.
 * @param {string} password - The password to check.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<boolean>} Returns true if the username and password match an admin credential, false otherwise.
 */
async function checkAdmin(username, password, database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, ADMINS_DB));
		if (snapshot.exists()) {
			const admins = snapshot.val() || [];
			for (i = 0; i < admins.length; i++) {
				if (
					username === admins[i].username &&
					bcrypt.compareSync(password, admins[i].password)
				) {
					return true;
				}
			}
			return false;
		}
		return false;
	} catch (error) {
		console.error("Error checking admin:", error);
		return false;
	}
}

async function addAdmin(username, password, database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, ADMINS_DB));
		admins = [];
		if (snapshot.exists()) {
			admins = snapshot.val() || [];
		}
		admins.push({
			username: username,
			password: bcrypt.hashSync(password, 10),
		});
		await update(dbRef, { [ADMINS_DB]: admins });
	} catch (error) {
		console.error("Error adding admin:", error);
	}
}

/**
 * Retrieves the sessions from the database.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<Array<object>>} Returns an array of session objects or an empty array if no sessions exist.
 */
async function getSessions(database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, SESSIONS_DB));
		if (snapshot.exists()) {
			return snapshot.val() || [];
		}
		return [];
	} catch (error) {
		console.error("Error fetching sessions:", error);
		return [];
	}
}

/**
 * Adds a session to the database.
 *
 * @param {string} username - The username of the session.
 * @param {string} sessionId - The session ID.
 * @param {number} expirationTimestamp - The expiration timestamp of the session.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {number} Returns 1 upon successful addition of the session.
 */
async function addSession(username, sessionId, expirationTimestamp, database) {
	dbRef = ref(database);
	try {
		sessions = await getSessions(database);
		sessions.push({
			username: username,
			sessionId: bcrypt.hashSync(sessionId, 1),
			expirationTimestamp: expirationTimestamp,
		});
		await update(dbRef, { [SESSIONS_DB]: sessions });
		return 1;
	} catch (error) {
		console.error("Error adding session:", error);
		return 1;
	}
}

/**
 * Extends the session expiration timestamp for a given user.
 *
 * @param {string} username - The username of the session to extend.
 * @param {string} sessionId - The session ID of the session to extend.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {number} Returns 1 upon successful extension of the session.
 */
async function extendSession(username, sessionId, database) {
	dbRef = ref(database);
	try {
		sessions = await getSessions(database);
		newSessions = [];
		const curTimestamp = Date.now();
		for (i = 0; i < sessions.length; i++) {
			if (
				sessions[i].username === username &&
				bcrypt.compareSync(sessionId, sessions[i].sessionId)
			) {
				sessions[i].expirationTimestamp = curTimestamp + SESSION_TIMEOUT;
			}
			if (sessions[i].expirationTimestamp > curTimestamp) {
				newSessions.push(sessions[i]);
			}
		}
		await update(dbRef, { [SESSIONS_DB]: newSessions });
		return 1;
	} catch (error) {
		console.error("Error extending session:", error);
		return 1;
	}
}

/**
 * Checks if a session is valid for a given username and session ID.
 *
 * @param {string} username - The username associated with the session.
 * @param {string} sessionId - The session ID to check.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<boolean>} A promise that resolves to true if the session is valid, false otherwise.
 */
async function checkSession(username, sessionId, database) {
	dbRef = ref(database);
	curTimestamp = Date.now();
	try {
		snapshot = await get(child(dbRef, SESSIONS_DB));
		sessions = [];
		if (snapshot.exists()) {
			sessions = snapshot.val() || [];
		}
		newSessions = [];
		auth = false;
		for (i = 0; i < sessions.length; i++) {
			if (sessions[i].expirationTimestamp <= curTimestamp) {
				continue;
			}
			newSessions.push(sessions[i]);
			if (
				sessions[i].username === username &&
				bcrypt.compareSync(sessionId, sessions[i].sessionId)
			) {
				auth = true;
			}
		}
		await update(dbRef, { [SESSIONS_DB]: newSessions });
		return auth;
	} catch (error) {
		console.error("Error checking session:", error);
		return false;
	}
}

/**
 * Generates a random alphanumeric ID of a specified length.
 *
 * @param {number} [length=10] - The length of the generated ID.
 * @return {string} The randomly generated alphanumeric ID.
 */
function generateRandomId(length = 10) {
	return Math.random()
		.toString(36)
		.substring(2, length + 2);
}

/**
 * Updates the system prompt in the database.
 *
 * @param {string} prompt - The new system prompt.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the system prompt is successfully updated, 1 if there was an error.
 */
async function updateSystemPrompt(prompt, database) {
	dbRef = ref(database);
	try {
		await update(dbRef, { [SYSTEM_PROMPT_DB]: prompt });
		return 0;
	} catch (error) {
		console.error("Error updating system prompt:", error);
		return 1;
	}
}

/**
 * Updates the classifier prompt in the database.
 *
 * @param {string} prompt - The new classifier prompt.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns a Promise that resolves to 0 if the classifier prompt is successfully updated, or rejects with an error.
 */
async function updateClassifierPrompt(prompt, database) {
	dbRef = ref(database);
	try {
		await update(dbRef, { [CLASSIFIER_PROMPT_DB]: prompt });
		return 0;
	} catch (error) {
		console.error("Error updating classifier prompt:", error);
		return 1;
	}
}

/**
 * Updates the reminder prompt in the database.
 *
 * @param {string} prompt - The new reminder prompt.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the reminder prompt is successfully updated, 1 if there was an error.
 */
async function updateReminderPrompt(prompt, database) {
	dbRef = ref(database);
	try {
		await update(dbRef, { [REMINDER_PROMPT_DB]: prompt });
		return 0;
	} catch (error) {
		console.error("Error updating reminder prompt:", error);
		return 1;
	}
}

/**
 * Updates the settings in the database.
 *
 * @param {number} reminderActivationTime - The time in minutes for the reminder activation.
 * @param {string} startMessage - The start message.
 * @param {string} helpMessage - The help message.
 * @param {string} resetMessage - The reset message.
 * @param {number} topKItems - The number of top items.
 * @param {number} threshold - The threshold.
 * @param {Object} database - The database object.
 * @return {Promise<number>} A Promise that resolves to 0 if the settings were successfully updated, or 1 if an error occurred.
 */
async function updateSettings(
	responseDelay,
	reminderActivationTime,
	startMessage,
	helpMessage,
	resetMessage,
	topKItems,
	threshold,
	database,
) {
	dbRef = ref(database);
	try {
		await update(child(dbRef, SETTINGS_DB), {
			responseDelay: responseDelay,
			reminderActivationTime: reminderActivationTime,
			startMessage: startMessage,
			helpMessage: helpMessage,
			resetMessage: resetMessage,
			topKItems: topKItems,
			threshold: threshold,
		});
		return 0;
	} catch (error) {
		console.error("Error updating settings:", error);
		return 1;
	}
}

/**
 * Adds a new user to the database.
 *
 * @param {string} userId - The ID of the user to add.
 * @param {string} description - The description of the new user.
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {number} Returns 0 if the user was successfully added, 1 if an error occurred.
 */
async function addUser(userId, description, database) {
	dbRef = ref(database);
	try {
		users = await getUsers(database);
		users.push({ userId: userId, description: description });
		await update(dbRef, { [USERS_DB]: users });
		return 0;
	} catch (error) {
		console.error("Error adding user:", error);
		return 1;
	}
}

/**
 * Updates the user's description in the database.
 *
 * @param {string} userId - The ID of the user to update.
 * @param {string} description - The new description for the user.
 * @param {Object} database - The Firebase Realtime Database instance.
 * @return {number} Returns 0 if the user's description was successfully updated, 1 if an error occurred.
 */
async function updateUser(userId, description, database) {
	dbRef = ref(database);
	try {
		users = await getUsers(database);
		code = 1;
		for (i = 0; i < users.length; i++) {
			if (users[i].userId === userId) {
				users[i].description = description;
				await update(dbRef, { [USERS_DB]: users });
				code = 0;
				break;
			}
		}
		return code;
	} catch (error) {
		console.error("Error updating user:", error);
		return 1;
	}
}

/**
 * Deletes a user from the database based on the provided user ID.
 *
 * @param {string} userId - The ID of the user to be deleted.
 * @param {object} database - The database object.
 * @return {Promise<number>} A Promise that resolves to 0 if the user is successfully deleted, or 1 if there is an error.
 */
async function deleteUser(userId, database) {
	dbRef = ref(database);
	try {
		users = await getUsers(database);
		newUsers = []
		for (i = 0; i < users.length; i++) {
			if (users[i].userId !== userId) {
				newUsers.push(users[i]);
			}
		}
		await update(dbRef, { [USERS_DB]: newUsers });
		return 0;
	} catch (error) {
		console.error("Error deleting user:", error);
		return 1;
	}
}

/**
 * Checks the authentication status of a request.
 *
 * @param {Object} req - The request object.
 * @param {Object} database - The database object.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating the authentication status.
 */
async function checkReqAuth(req, database) {
	const username = req.cookies.username;
	const sessionId = req.cookies.sessionId;
	const auth = await checkSession(username, sessionId, database);
	return auth;
}

/**
 * Updates the vector database by deleting all existing vectors and re-inserting new vectors based on the items in the database.
 *
 * @param {Object} database - The database object.
 * @param {Object} index - The index object.
 * @return {Promise<void>} A Promise that resolves when the vector database is updated.
 */
async function updateVectorDatabase(database, index) {
	const items = await getItems(database);
	try {
		index.namespace(VECTOR_DB_NAMESPACE).deleteAll();
	} catch (error) {
		console.error("Error deleting vector database:", error);
	}

	for (i = 0; i < items.length; i++) {
		const item = items[i];
		const vector = await getEmbedding(
			JSON.stringify(item),
			process.env.EMBEDDING_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
		);
		index
			.namespace(VECTOR_DB_NAMESPACE)
			.upsert([{ id: String(item.id), values: vector, metadata: item }]);
	}
}

module.exports = {
	addItem,
	updateItem,
	deleteItem,
	addIntent,
	updateIntent,
	deleteIntent,
	updateSettings,
	checkAdmin,
	addAdmin,
	getSessions,
	addSession,
	extendSession,
	checkSession,
	generateRandomId,
	updateSystemPrompt,
	updateClassifierPrompt,
	updateReminderPrompt,
	addUser,
	updateUser,
	deleteUser,
	checkReqAuth,
	updateVectorDatabase,
};
