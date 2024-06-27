const { ref, get, set, child, update } = require("firebase/database");
const {
  CHATS_DB,
  PRODUCTS_DB,
  TRIGGERS_DB,
  INTENTS_DB,
  SYSTEM_PROMPT_DB,
  FORGOTTEN_CHAT_LIMIT,
} = require("./constants");

function getUserId(userId) {
  const regex = /^[A-Za-z0-9]+$/;
  if (!regex.test(userId)) {
    let index = userId.search(/[^A-Za-z0-9]/);
    if (index !== -1) {
      return userId.substring(0, index);
    }
  }
  return userId;
}

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

async function getMessages(database, userId) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, CHATS_DB + getUserId(userId)));
    if (snapshot.exists()) {
      return snapshot.val()["messages"] || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

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

async function getProducts(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, PRODUCTS_DB));
    if (snapshot.exists()) {
      return snapshot.val() || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

async function getTriggers(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, TRIGGERS_DB));
    if (snapshot.exists()) {
      return snapshot.val() || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return [];
  }
}

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

async function getIntents(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, INTENTS_DB));
    if (snapshot.exists()) {
      return snapshot.val() || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching buyers:", error);
    return [];
  }
}

async function getSystemPrompt(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, SYSTEM_PROMPT_DB));
    if (snapshot.exists()) {
      return snapshot.val();
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error fetching system prompt:", error);
    return "";
  }
}

async function getForgottenChats(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, CHATS_DB));
    if (snapshot.exists()) {
      const chats = snapshot.val() || {};
      forgottenChats = {};
      const curTimestamp = Date.now();
      Object.keys(chats).forEach((chatId) => {
        const chat = chats[chatId];
        if (
          chat["lastUpdate"] < curTimestamp - FORGOTTEN_CHAT_LIMIT &&
          !chat["reminderLast"]
        ) {
          forgottenChats[chatId] = chat;
        }
      });
      return forgottenChats;
    } else {
      return {};
    }
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
