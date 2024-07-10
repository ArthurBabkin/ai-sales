const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { Pinecone } = require("@pinecone-database/pinecone");
const {
	addProduct,
	updateProduct,
	deleteProduct,
	addIntent,
	updateIntent,
	deleteIntent,
	checkAdmin,
	addSession,
	extendSession,
	generateRandomId,
	updateSystemPrompt,
	updateClassifierPrompt,
	updateReminderPrompt,
	checkReqAuth,
	updateVectorDatabase,
} = require("./database");
const { SESSION_TIMEOUT } = require("./constants");
const {
	getProducts,
	getIntents,
	getSystemPrompt,
	getClassifierPrompt,
	getReminderPrompt,
} = require("../bot/database");
const { INDEX_NAME } = require("../bot/constants");

const pc = new Pinecone({
	apiKey: process.env.PINECONE_TOKEN,
});
const index = pc.index(INDEX_NAME);

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
});

app.get("/system-prompts", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		res.sendFile(path.join(__dirname, "public", "system-prompts.html"));
	} else {
		res.redirect("/auth");
	}
});

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
			Number.parseFloat(productPrice),
			database,
			index,
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
			Number.parseFloat(price),
			Number.parseInt(id),
			database,
			index,
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
		const code = await deleteProduct(Number.parseInt(id), database, index);
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

app.post("/submit-intent", async (req, res) => {
	const { intentName, intentDescription } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await addIntent(intentName, intentDescription, database);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

app.post("/update-intent", async (req, res) => {
	const { intentName, intentDescription, intentId } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateIntent(
			intentName,
			intentDescription,
			Number.parseInt(intentId),
			database,
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

app.post("/delete-intent", async (req, res) => {
	const { intentId } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await deleteIntent(Number.parseInt(intentId), database);
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

app.get("/get-system-prompt", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const prompt = await getSystemPrompt(database);
		res.json({ prompt: prompt });
	} else {
		res.json({ prompt: "" });
	}
});

app.get("/get-classifier-prompt", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const prompt = await getClassifierPrompt(database);
		res.json({ prompt: prompt });
	} else {
		res.json({ prompt: "" });
	}
});

app.get("/get-reminder-prompt", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const prompt = await getReminderPrompt(database);
		res.json({ prompt: prompt });
	} else {
		res.json({ prompt: "" });
	}
});

app.post("/update-system-prompt", async (req, res) => {
	const { prompt } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateSystemPrompt(prompt, database);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

app.post("/update-classifier-prompt", async (req, res) => {
	const { prompt } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateClassifierPrompt(prompt, database);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

app.post("/update-reminder-prompt", async (req, res) => {
	const { prompt } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateReminderPrompt(prompt, database);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

setInterval(() => updateVectorDatabase(database, index), 20 * 60 * 1000);

app.listen(port, () => {
	console.log(`Server is running on http://localhost:${port}`);
});
