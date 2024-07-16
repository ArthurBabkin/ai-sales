const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { addAdmin } = require("./database");

const firebaseConfig = {
  apiKey: process.env.API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  databaseURL: process.env.DATABASE_URL,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGING_SENDER_ID,
  appId: process.env.APP_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
const database = getDatabase(firebaseApp);

const username = "admin"
const password = "password"

async function main() {
  try {
    addAdmin(username, password, database)
    console.log("Success")
  } catch (error) {
    console.error(error)
  }
}

main().then(() => {
  process.exit(0);
});
