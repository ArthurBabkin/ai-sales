const { ref, child, get, update } = require("firebase/database");
const { GROUPS_DB } = require("./constants");

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

module.exports = { getGroups, addGroup, removeGroup };
