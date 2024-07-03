const { initializeApp } = require("firebase/app");
const { getDatabase, ref, child, set, update } = require("firebase/database");
const {
	addMessage,
	getMessages,
	resetUser,
	getProducts,
	getIntents,
	getTriggers,
	addTrigger,
	getSystemPrompt,
	getForgottenChats,
} = require("../database");
const {
	PRODUCTS_DB,
	INTENTS_DB,
	TRIGGERS_DB,
	SYSTEM_PROMPT_DB,
	CHATS_DB,
} = require("../constants");

const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	databaseURL: "http://127.0.0.1:9000",
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

test("addMessage + getMessages + resetUser", async () => {
	const userId = "user123";
	const message = {
		role: "user",
		content: "Hello, World!",
	};

	await resetUser(db, userId);
	await addMessage(db, userId, message);
	const retrievedMessage = await getMessages(db, userId);

	expect(retrievedMessage).toEqual([message]);
	expect(retrievedMessage.length).toBe(1);

	await resetUser(db, userId);
	const retrievedMessage2 = await getMessages(db, userId);
	expect(retrievedMessage2).toEqual([]);
});

test("getProducts", async () => {
	await set(child(ref(db), PRODUCTS_DB), []);
	const products = await getProducts(db);
	expect(products).toEqual([]);

	await set(child(ref(db), `${PRODUCTS_DB}/0`), {
		name: "Product 1",
		description: "Description 1",
		price: 10,
		id: 0,
	});

	const products2 = await getProducts(db);
	expect(products2).toEqual([
		{
			name: "Product 1",
			description: "Description 1",
			price: 10,
			id: 0,
		},
	]);
});

test("getIntents", async () => {
	await set(child(ref(db), INTENTS_DB), []);
	const intents = await getIntents(db);
	expect(intents).toEqual([]);

	await set(child(ref(db), `${INTENTS_DB}/0`), {
		name: "Intent 1",
		description: "Description 1",
		id: 0,
	});

	const intents2 = await getIntents(db);
	expect(intents2).toEqual([
		{
			name: "Intent 1",
			description: "Description 1",
			id: 0,
		},
	]);
});

test("getTriggers + addTrigger", async () => {
	await set(child(ref(db), TRIGGERS_DB), []);
	const triggers = await getTriggers(db);
	expect(triggers).toEqual([]);

	await addTrigger(db, "user123", "trigger");
	const triggers2 = await getTriggers(db);
	expect(triggers2).toEqual([{ userId: "user123", trigger: "trigger" }]);
});

test("getSystemPrompt", async () => {
	await set(child(ref(db), SYSTEM_PROMPT_DB), "");
	const systemPrompt = await getSystemPrompt(db);
	expect(systemPrompt).toEqual("");

	await set(child(ref(db), SYSTEM_PROMPT_DB), "Hello, World!");
	const systemPrompt2 = await getSystemPrompt(db);
	expect(systemPrompt2).toEqual("Hello, World!");
});

test("addMessage + getForgottenChats", async () => {
	await set(child(ref(db), CHATS_DB), {});
	const forgottenChats = await getForgottenChats(db);
	expect(forgottenChats).toEqual({});

	await addMessage(db, "user123", { role: "user", content: "Hello!" });
	const forgottenChats2 = await getForgottenChats(db);
	expect(forgottenChats2).toEqual({});

	const date = Date.now() - 20 * 60 * 1000;
	await update(child(ref(db), `${CHATS_DB}/user123`), {
		lastUpdate: date,
	});

	const forgottenChats3 = await getForgottenChats(db);
	expect(forgottenChats3).toEqual({
		user123: {
			lastUpdate: date,
			messages: [{ role: "user", content: "Hello!" }],
			reminderLast: false,
		},
	});

	await update(child(ref(db), `${CHATS_DB}/user123`), {
		reminderLast: true,
	});
	const forgottenChats4 = await getForgottenChats(db);
	expect(forgottenChats4).toEqual({});
});
