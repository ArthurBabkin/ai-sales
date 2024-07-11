const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const path = require("node:path");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { Pinecone } = require("@pinecone-database/pinecone");
const {
	addItem,
	updateItem,
	deleteItem,
	addIntent,
	updateIntent,
	deleteIntent,
	updateSettings,
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
	getItems,
	getIntents,
	getSystemPrompt,
	getClassifierPrompt,
	getReminderPrompt,
	getSettings,
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

app.get("/items", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		res.sendFile(path.join(__dirname, "public", "items.html"));
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

app.get("/settings", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		res.sendFile(path.join(__dirname, "public", "settings.html"));
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

app.post("/submit-item", async (req, res) => {
	const { itemName, itemDescription } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await addItem(itemName, itemDescription, database, index);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

app.post("/update-item", async (req, res) => {
	const { name, description, id } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateItem(
			name,
			description,
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

app.post("/delete-item", async (req, res) => {
	const { id } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await deleteItem(Number.parseInt(id), database, index);
		if (code === 0) {
			res.json({ success: true });
		} else {
			res.json({ success: false });
		}
	} else {
		res.json({ success: false });
	}
});

app.get("/list-items", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const items = await getItems(database);
		res.json({ items: items });
	} else {
		res.json({ items: [] });
	}
});

app.post("/submit-intent", async (req, res) => {
	const { intentName, intentDescription, intentAnswer } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await addIntent(
			intentName,
			intentDescription,
			intentAnswer,
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

app.post("/update-intent", async (req, res) => {
	const { intentName, intentDescription, intentAnswer, intentId } = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		await extendSession(req.cookies.username, req.cookies.sessionId, database);
		const code = await updateIntent(
			intentName,
			intentDescription,
			intentAnswer,
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

app.post("/update-settings", async (req, res) => {
	const {
		responseDelay,
		reminderActivationTime,
		startMessage,
		helpMessage,
		resetMessage,
		topKItems,
		threshold,
	} = req.body;
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const code = await updateSettings(
			responseDelay,
			reminderActivationTime,
			startMessage,
			helpMessage,
			resetMessage,
			topKItems,
			threshold,
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

app.get("/list-settings", async (req, res) => {
	const auth = await checkReqAuth(req, database);
	if (auth) {
		const settings = await getSettings(database);
		res.json({ settings: settings });
	} else {
		res.json({ settings: {} });
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
