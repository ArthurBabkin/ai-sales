const { getGeminiResponse, getUserIntent } = require("../api");
const { CLASSIFIER_MESSAGE } = require("../constants");

test("getGeminiResponse", async () => {
	const response = await getGeminiResponse(
		[{ role: "user", content: "Hello" }],
		process.env.GEMINI_MODEL,
		process.env.GEMINI_TOKEN,
		process.env.PROXY_URL,
	);
	expect(typeof response).toEqual("string");
});

test("getUserIntent", async () => {
	const response = await getUserIntent(
		[
			{
				role: "user",
				content: "I want to contact the manager. Redirect me to them.",
			},
		],
		[
			{
				name: "manager",
				description: "User asked to contact the manager",
				id: 0,
			},
		],
		"Hello",
		process.env.GEMINI_MODEL,
		process.env.GEMINI_TOKEN,
		process.env.PROXY_URL,
	);
	expect(typeof response).toEqual("string");
});
