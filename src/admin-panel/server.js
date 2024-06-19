require("dotevn").config();
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("path");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const {
  addProduct,
  updateProduct,
  deleteProduct,
  updateIntent,
  deleteIntent,
  checkAdmin,
  addSession,
  checkSession,
  extendSession,
  generateRandomId,
} = require("./utils");
const { SESSION_TIMEOUT } = require("./constants");
const { getProducts, getIntents } = require("../bot/database");

async function checkReqAuth(req, database) {
  const username = req.cookies.username;
  const sessionId = req.cookies.sessionId;
  const auth = await checkSession(username, sessionId, database);
  return auth;
}
const app = express();
const port = process.env.PORT;

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

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser());

app.get("/", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    res.sendFile(path.join(__dirname, "public", "admin-panel.html"));
  } else {
    res.redirect("/auth");
  }
});

app.get("/products", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    res.sendFile(path.join(__dirname, "public", "products.html"));
  } else {
    res.redirect("/auth");
  }
});

app.get("/intents", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    res.sendFile(path.join(__dirname, "public", "intents.html"));
  } else {
    res.redirect("/auth");
  }
})

app.get("/auth", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (!auth) {
    res.sendFile(path.join(__dirname, "public", "auth.html"));
  } else {
    res.redirect("/");
  }
});


app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const auth = await checkAdmin(username, password, database);
  if (auth) {
    const sessionId = generateRandomId(10);
    const expirationTimestamp = Date.now() + SESSION_TIMEOUT;
    res.cookie("username", username);
    res.cookie("sessionId", sessionId);
    await addSession(username, sessionId, expirationTimestamp, database);
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

app.post("/submit-product", async (req, res) => {
  const { productName, productDescription, productPrice } = req.body;
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    const code = await addProduct(
      productName,
      productDescription,
      parseFloat(productPrice),
      database
    );
    if (code === 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.post("/update-product", async (req, res) => {
  const { name, description, price, id } = req.body;
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    const code = await updateProduct(
      name,
      description,
      parseFloat(price),
      parseInt(id),
      database
    );
    if (code === 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.post("/delete-product", async (req, res) => {
  const { id } = req.body;
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    const code = await deleteProduct(parseInt(id), database);
    if (code === 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.get("/list-products", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (auth) {
    const products = await getProducts(database);
    res.json({ products: products });
  } else {
    res.json({ products: [] });
  }
});

app.post("/update-intent", async (req, res) => {
  const { name, description } = req.body;
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    const code = await updateIntent(name, description, database);
    if (code === 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.post("/delete-intent", async (req, res) => {
  const { name } = req.body;
  const auth = await checkReqAuth(req, database);
  if (auth) {
    await extendSession(req.cookies.username, req.cookies.sessionId, database);
    const code = await deleteIntent(name, database);
    if (code === 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } else {
    res.json({ success: false });
  }
});

app.get("/list-intents", async (req, res) => {
  const auth = await checkReqAuth(req, database);
  if (auth) {
    const intents = await getIntents(database);
    res.json({ intents: intents });
  } else {
    res.json({ intents: [] });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
