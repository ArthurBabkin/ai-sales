const { ref, child, get, update, remove, set } = require("firebase/database");
const { GROUPS_DB, SERVICES_DB, ONGOING_SERVICES_DB, SERVICE_TIMEOUT } = require("./constants");
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


/**
 * Adds an ongoing service to the database for a specific seller and user.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {string} sellerId - The ID of the seller.
 * @param {string} userId - The ID of the user for the ongoing service.
 * @return {Promise<number>} Returns 1 if the service was added successfully, 0 if there was an error.
 */
async function addOngoingService(database, sellerId, userId) {
	dbRef = ref(database);
	try {
		await set(child(dbRef, ONGOING_SERVICES_DB + sellerId), [userId, Date.now()]);
		return 1;
	} catch (error) {
		console.error("Error adding ongoing service:", error);
		return 0;
	}
}

/**
 * Removes an ongoing service from the database for a specific user.
 *
 * @param {object} database - The Firebase Realtime Database reference.
 * @param {string} sellerId - The ID of the seller for the ongoing service.
 * @return {Promise<number>} Returns 1 if the service was removed successfully, 0 if there was an error.
 */
async function removeOngoingService(database, sellerId) {
	dbRef = ref(database);
	try {
		await remove(child(dbRef, ONGOING_SERVICES_DB + sellerId));
		return 1;
	} catch (error) {
		console.error("Error removing ongoing service:", error);
		return 0;
	}
}

async function getServedUser(database, sellerId) {
	dbRef = ref(database);
	try {
		snapshot = await get(child(dbRef, ONGOING_SERVICES_DB + sellerId));
		if (snapshot.exists()) {
			return snapshot.val()[0];
		}
		return null;
	} catch (error) {
		console.error("Error getting served user:", error);
		return null;
	}
}

async function checkOngoingService(database, sellerId, userId = null) {
	dbRef = ref(database);
	try {
		snapshot = await get(child(dbRef, ONGOING_SERVICES_DB + sellerId));
		if (userId) {
			console.log("Returning", snapshot.exists() && snapshot.val()[0] === userId);
			return snapshot.exists() && snapshot.val()[0] === userId;
		}

		console.log("Returning", snapshot.exists() && Date.now() - snapshot.val()[1] < SERVICE_TIMEOUT);
		return snapshot.exists() && Date.now() - snapshot.val()[1] < SERVICE_TIMEOUT;

	} catch (error) {
		console.error("Error checking ongoing service:", error);
		return false;
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
	addOngoingService,
	removeOngoingService,
	getServedUser,
	checkOngoingService,
};
