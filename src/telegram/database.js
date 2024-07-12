const { ref, child, get, update } = require("firebase/database");
const { GROUPS_DB, SERVICES_DB } = require("./constants");
const { TRIGGERS_DB } = require("../bot/constants");

/**
 * Retrieves the groups from the database.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {array} An array of groups retrieved from the database.
 */
async function getGroups(database) {
	dbRef = ref(database);
	try {
		snapshot = await get(child(dbRef, GROUPS_DB));
		chats = [];
		if (snapshot.exists()) {
			chats = snapshot.val() || [];
		}
		return chats;
	} catch (error) {
		console.error("Error getting chats:", error);
		return [];
	}
}

/**
 * Adds a group to the database.
 *
 * @param {any} chatId - The ID of the chat to be added to the group.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the group was added successfully, or 1 if an error occurred.
 */
async function addGroup(chatId, database) {
	dbRef = ref(database);
	try {
		chats = await getGroups(database);
		chats.push(chatId);
		chats = Array.from(new Set(chats));
		await update(dbRef, { [GROUPS_DB]: chats });
		return 0;
	} catch (error) {
		console.error("Error adding chat:", error);
		return 1;
	}
}

/**
 * Removes a group from the database.
 *
 * @param {any} chatId - The ID of the chat to be removed from the group.
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the group was removed successfully, or 1 if an error occurred.
 */
async function removeGroup(chatId, database) {
	dbRef = ref(database);
	try {
		code = 1;
		chats = await getGroups(database);
		newChats = [];
		for (i = 0; i < chats.length; i++) {
			if (chats[i] !== chatId) {
				newChats.push(chats[i]);
			} else {
				code = 0;
			}
		}

		await update(dbRef, { [GROUPS_DB]: newChats });
		return code;
	} catch (error) {
		console.error("Error removing group:", error);
		return 1;
	}
}

/**
 * Clears all triggers in the database.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<void>} Returns a Promise that resolves if the triggers were cleared successfully, or rejects with an error if an error occurred.
 */
async function clearTriggers(database) {
	dbRef = ref(database);
	try {
		await update(dbRef, { [TRIGGERS_DB]: [] });
	} catch (error) {
		console.error("Error clearing triggers:", error);
	}
}

/**
 * Retrieves the services from the database.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {object} The retrieved services from the database.
 */
async function getServices(database) {
	dbRef = ref(database);
	try {
		snapshot = await get(child(dbRef, SERVICES_DB));
		sellers = {};
		if (snapshot.exists()) {
			sellers = snapshot.val() || {};
		}
		return sellers;
	} catch (error) {
		console.error("Error getting services:", error);
		return {};
	}
}

/**
 * Adds a service to the database for a specific seller.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} userId - The ID of the user to add as a service for the seller.
 */
async function addService(database, sellerId, userId) {
	dbRef = ref(database);
	try {
		services = await getServices(database);
		if (!services[sellerId]) {
			services[sellerId] = [];
		}
		services[sellerId].push(userId);
		await update(dbRef, { [SERVICES_DB]: services });
	} catch (error) {
		console.error("Error adding service:", error);
	}
}

/**
 * Resets the services in the database to an empty object.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @return {Promise<number>} Returns 0 if the reset was successful, 1 if there was an error.
 */
async function resetServices(database) {
	dbRef = ref(database);
	try {
		await update(dbRef, { [SERVICES_DB]: {} });
		return 0;
	} catch (error) {
		console.error("Error resetting services:", error);
		return 1;
	}
}

module.exports = {
	getGroups,
	addGroup,
	removeGroup,
	clearTriggers,
	getServices,
	addService,
	resetServices,
};
