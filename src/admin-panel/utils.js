const bcrypt = require("bcrypt");
const { ref, update, get, child, remove } = require("firebase/database");
const { ADMINS_DB, SESSIONS_DB, SESSION_TIMEOUT } = require("./constants");
const { getProducts } = require("../bot/database");
const { PRODUCTS_DB, INTENTS_DB } = require("../bot/constants");

async function addProduct(name, description, price, database) {
  dbRef = ref(database);
  try {
    products = await getProducts(database);
    products.sort((a, b) => a["id"] - b["id"]);
    for (i = 0; i < products.length; i++) {
      products[i]["id"] = i;
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

async function updateProduct(name, description, price, id, database) {
  dbRef = ref(database);
  try {
    code = 1;
    products = await getProducts(database);
    products.sort((a, b) => a["id"] - b["id"]);
    for (i = 0; i < products.length; i++) {
      if (products[i]["id"] === id) {
        products[i]["name"] = name;
        products[i]["description"] = description;
        products[i]["price"] = price;
        code = 0;
      }
      products[i]["id"] = i;
    }
    await update(dbRef, { [PRODUCTS_DB]: products });
    return code;
  } catch (error) {
    console.error("Error updating product:", error);
    return 1;
  }
}

async function deleteProduct(id, database) {
  dbRef = ref(database);
  try {
    code = 1;
    products = await getProducts(database);
    products.sort((a, b) => a["id"] - b["id"]);
    newProducts = [];
    for (i = 0; i < products.length; i++) {
      if (products[i]["id"] === id) {
        code = 0;
        continue;
      }
      products[i]["id"] = i;
      newProducts.push(products[i]);
    }
    await update(dbRef, { [PRODUCTS_DB]: newProducts });
    return code;
  } catch (error) {
    console.error("Error deleting product:", error);
    return 1;
  }
}

async function updateIntent(name, description, database) {
  dbRef = ref(database);
  try {
    await update(child(dbRef, INTENTS_DB), { [name]: description });
    return 0;
  } catch (error) {
    console.error("Error updating intents:", error);
    return 1;
  }
}

async function deleteIntent(name, database) {
  dbRef = ref(database);
  try {
    await remove(child(dbRef, INTENTS_DB + "/" + name));
    return 0;
  } catch (error) {
    console.error("Error deleting intent:", error);
    return 1;
  }
}

async function checkAdmin(username, password, database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, ADMINS_DB));
    if (snapshot.exists()) {
      const admins = snapshot.val() || [];
      for (i = 0; i < admins.length; i++) {
        if (
          username === admins[i]["username"] &&
          bcrypt.compareSync(password, admins[i]["password"])
        ) {
          return true;
        }
      }
      return false;
    } else {
      return false;
    }
  } catch (error) {
    console.error("Error checking admin:", error);
    return false;
  }
}

async function getSessions(database) {
  dbRef = ref(database);
  try {
    const snapshot = await get(child(dbRef, SESSIONS_DB));
    if (snapshot.exists()) {
      return snapshot.val() || [];
    } else {
      return [];
    }
  } catch (error) {
    console.error("Error fetching sessions:", error);
    return [];
  }
}

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

async function extendSession(username, sessionId, database) {
  dbRef = ref(database);
  try {
    sessions = await getSessions(database);
    newSessions = [];
    const curTimestamp = Date.now();
    for (i = 0; i < sessions.length; i++) {
      if (
        sessions[i]["username"] === username &&
        bcrypt.compareSync(sessionId, sessions[i]["sessionId"])
      ) {
        sessions[i]["expirationTimestamp"] = curTimestamp + SESSION_TIMEOUT;
      }
      if (sessions[i]["expirationTimestamp"] > curTimestamp) {
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
      if (sessions[i]["expirationTimestamp"] <= curTimestamp) {
        continue;
      }
      newSessions.push(sessions[i]);
      if (
        sessions[i]["username"] == username &&
        bcrypt.compareSync(sessionId, sessions[i]["sessionId"])
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

function generateRandomId(length = 10) {
  return Math.random()
    .toString(36)
    .substring(2, length + 2);
}

module.exports = {
  addProduct,
  updateProduct,
  deleteProduct,
  updateIntent,
  deleteIntent,
  checkAdmin,
  getSessions,
  addSession,
  extendSession,
  checkSession,
  generateRandomId,
};
