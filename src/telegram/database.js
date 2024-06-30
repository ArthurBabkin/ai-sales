const { ref, child, get, update } = require("firebase/database");
const { GROUPS_DB, SERVICES_DB } = require("./constants");
const { TRIGGERS_DB } = require("../bot/constants");

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

async function removeGroup(chatId, database) {
  dbRef = ref(database);
  try {
    code = 1;
    chats = await getGroups(database);
    newChats = [];
    for (i = 0; i < chats.length; i++) {
      if (chats[i] != chatId) {
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

async function clearTriggers(database) {
  dbRef = ref(database);
  try {
    await update(dbRef, { [TRIGGERS_DB]: [] });
  } catch (error) {
    console.error("Error clearing triggers:", error);
  }
}

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

module.exports = {
  getGroups,
  addGroup,
  removeGroup,
  clearTriggers,
  getServices,
  addService,
};
