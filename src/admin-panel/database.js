const bcrypt = require("bcrypt");
const { ref, update, get, child } = require("firebase/database");
const { ADMINS_DB, SESSIONS_DB, SESSION_TIMEOUT } = require("./constants");
const { getProducts, getIntents } = require("../bot/database");
const {
	PRODUCTS_DB,
	INTENTS_DB,
	SYSTEM_PROMPT_DB,
} = require("../bot/constants");

/**
 * Adds a new product to the database.
 *
 * @param {string} name - The name of the product.
 * @param {string} description - The description of the product.
 * @param {number} price - The price of the product.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the product was added successfully, or 1 if an error occurred.
 */
async function addProduct(name, description, price, database) {
	dbRef = ref(database);
	try {
		products = await getProducts(database);
		products.sort((a, b) => a.id - b.id);
		for (i = 0; i < products.length; i++) {
			products[i].id = i;
		}
		products.push({
			name: name,
			description: description,
			price: price,
			id: products.length,
		});
		await update(dbRef, { [PRODUCTS_DB]: products });
		return 0;
	} catch (error) {
		console.error("Error adding new product:", error);
		return 1;
	}
}

/**
 * Updates a product in the database.
 *
 * @param {string} name - The new name of the product.
 * @param {string} description - The new description of the product.
 * @param {number} price - The new price of the product.
 * @param {number} id - The ID of the product to be updated.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the product was updated successfully, or 1 if an error occurred.
 */
async function updateProduct(name, description, price, id, database) {
	dbRef = ref(database);
	try {
		code = 1;
		products = await getProducts(database);
		products.sort((a, b) => a.id - b.id);
		for (i = 0; i < products.length; i++) {
			if (products[i].id === id) {
				products[i].name = name;
				products[i].description = description;
				products[i].price = price;
				code = 0;
			}
			products[i].id = i;
		}
		await update(dbRef, { [PRODUCTS_DB]: products });
		return code;
	} catch (error) {
		console.error("Error updating product:", error);
		return 1;
	}
}

/**
 * Deletes a product from the database based on the provided ID.
 *
 * @param {number} id - The ID of the product to be deleted.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the product was deleted successfully, or 1 if an error occurred.
 */
async function deleteProduct(id, database) {
	dbRef = ref(database);
	try {
		code = 1;
		products = await getProducts(database);
		products.sort((a, b) => a.id - b.id);
		newProducts = [];
		for (i = 0; i < products.length; i++) {
			if (products[i].id === id) {
				code = 0;
				continue;
			}
			products[i].id = i;
			newProducts.push(products[i]);
		}
		await update(dbRef, { [PRODUCTS_DB]: newProducts });
		return code;
	} catch (error) {
		console.error("Error deleting product:", error);
		return 1;
	}
}

/**
 * Adds an intent to the database with the given name and description.
 *
 * @param {string} name - The name of the intent.
 * @param {string} description - The description of the intent.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the intent was added successfully, or 1 if an error occurred.
 */
async function addIntent(name, description, database) {
	dbRef = ref(database);
	try {
		const snapshot = await get(child(dbRef, INTENTS_DB));
		const intents = snapshot.val() || [];
		code = 1;
		intents.push({ name: name, description: description });
		for (i = 0; i < intents.length; i++) {
			intents[i].id = i;
		}
		await update(dbRef, { [INTENTS_DB]: intents });
		return 0;
	} catch (error) {
		console.error("Error adding intent:", error);
		return 1;
	}
}

/**
 * Updates an intent in the database with the given name, description, and id.
 *
 * @param {string} name - The new name of the intent.
 * @param {string} description - The new description of the intent.
 * @param {number} id - The id of the intent to update.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the intent was updated successfully, or 1 if an error occurred.
 */
async function updateIntent(name, description, id, database) {
	dbRef = ref(database);
	try {
		code = 1;
		intents = await getIntents(database);
		intents.sort((a, b) => a.id - b.id);
		for (i = 0; i < intents.length; i++) {
			if (intents[i].id === id) {
				intents[i].name = name;
				intents[i].description = description;
				code = 0;
			}
			intents[i].id = i;
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
		intents.sort((a, b) => a.id - b.id);
		newIntents = [];
		for (i = 0; i < intents.length; i++) {
			if (intents[i].id === id) {
				code = 0;
				continue;
			}
			intents[i].id = i;
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

module.exports = {
	addProduct,
	updateProduct,
	deleteProduct,
	addIntent,
	updateIntent,
	deleteIntent,
	checkAdmin,
	getSessions,
	addSession,
	extendSession,
	checkSession,
	generateRandomId,
	updateSystemPrompt,
};
