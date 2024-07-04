const { Pinecone } = require("@pinecone-database/pinecone");
const { getProducts } = require("../bot/database");
const { initializeApp } = require("firebase/app");
const { getDatabase } = require("firebase/database");
const { getEmbedding } = require("../bot/api");

const firebaseConfig = {
	apiKey: process.env.API_KEY,
	authDomain: process.env.AUTH_DOMAIN,
	databaseURL: process.env.DATABASE_URL,
	projectId: process.env.PROJECT_ID,
	storageBucket: process.env.STORAGE_BUCKET,
	messagingSenderId: process.env.MESSAGING_SENDER_ID,
	appId: process.env.APP_ID,
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const pc = new Pinecone({
	apiKey: process.env.PINECONE_TOKEN,
});
const index = pc.index("ai-sales");

async function main() {
	const products = await getProducts(db);
	await index.namespace("products").deleteAll();
	for (i = 0; i < products.length; i++) {
		const product = products[i];
		const vector = await getEmbedding(
			JSON.stringify(product),
			process.env.EMBEDDING_MODEL,
			process.env.GEMINI_TOKEN,
			process.env.PROXY_URL,
		);
		await index
			.namespace("products")
			.upsert([{ id: String(product.id), values: vector }]);
		console.log(product);
	}
}

main();
