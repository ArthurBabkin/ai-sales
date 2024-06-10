const {
  getDatabase,
  ref,
  get,
  set,
  child,
  update,
} = require("firebase/database");

const { USERS_DB, PRODUCTS_DB, BUYERS_DB } = require("./constants");

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
  await set(child(dbRef, USERS_DB + getUserId(userId)), {
    messages: messages,
  });
}

async function getMessages(database, userId) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, USERS_DB + getUserId(userId)));
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

async function addMessage(database, userId, message) {
  messages = await getMessages(database, userId);
  dbRef = ref(database);
  messages.push(message);
  await update(child(dbRef, USERS_DB + getUserId(userId)), {
    messages: messages,
  });
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

async function getBuyers(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, BUYERS_DB));
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

async function addBuyer(database, userId) {
  dbRef = ref(database);
  try {
    buyers = await getBuyers(database);
    buyers.push(userId);
    await update(dbRef, {[BUYERS_DB]: buyers});
  } catch (error) {
    console.error("Error adding user to buyers:", error);
  }
}

module.exports = { resetUser, getMessages, addMessage, getProducts, getBuyers, addBuyer };
