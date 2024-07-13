const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

/**
 * Retrieves a Gemini response based on the input messages, model name, token, proxy, and optional system message.
 *
 * @param {Array} messages - The array of messages to be included in the response.
 * @param {string} modelName - The name of the model used for generating the response.
 * @param {string} token - The authentication token for accessing the model.
 * @param {string} proxy - The proxy URL for making the request.
 * @param {string} [systemMessage=null] - Optional system message to prepend to the messages.
 * @return {string|number} The generated response or an error code.
 */
async function getGeminiResponse(
	messages,
	modelName,
	token,
	proxy,
	systemMessages = null,
) {
	newMessages = messages;
	if (systemMessages != null) {
		for (i = systemMessages.length - 1; i >= 0; i--) {
			newMessages = [{ role: "user", content: systemMessages[i] }].concat(newMessages);	
		}
	}
	geminiMessages = [];
	map = {
		user: "user",
		assistant: "model",
	};
	for (i = 0; i < newMessages.length; i++) {
		geminiMessages.push({
			role: map[newMessages[i].role],
			parts: [{ text: newMessages[i].content }],
		});
	}
	const url = `https://generativelanguage.googleapis.com/v1/models/${modelName}:generateContent?key=${token}`;
	const agent = new HttpsProxyAgent(proxy);
	try {
		const response = await axios({
			method: "post",
			url: url,
			headers: {
				"Content-Type": "application/json",
			},
			data: {
				contents: geminiMessages,
			},
			httpsAgent: agent,
		});
		return response.data.candidates[0].content.parts[0].text;
	} catch (error) {
		console.error("Error getting response:", error);
		return 1;
	}
}

/**
 * Retrieves the user's intent based on the given messages, intents, prompt, model name, token, and proxy.
 *
 * @param {Array<Object>} messages - An array of messages in the dialogue.
 * @param {Array<Object>} intents - An array of intents.
 * @param {string} prompt - The prompt for the dialogue.
 * @param {string} modelName - The name of the model.
 * @param {string} token - The token for authentication.
 * @param {string} proxy - The proxy URL.
 * @return {Promise<string>} The result of the user's intent.
 */
async function getUserIntent(
	messages,
	intents,
	prompt,
	modelName,
	token,
	proxy,
) {
	classificationIntents = [];
	for (i = 0; i < intents.length; i++) {
		classificationIntents.push({
			name: intents[i].name,
			description: intents[i].description,
		});
	}
	const message = `${prompt}\nIntents:\n${JSON.stringify(classificationIntents)}\nDialogue:\n${JSON.stringify(messages)}`;
	result = await getGeminiResponse(
		[{ role: "user", content: message }],
		modelName,
		token,
		proxy,
	);
	return result;
}

/**
 * Retrieves the embedding of a given text using a specific model and API token.
 *
 * @param {string} text - The text to get the embedding of.
 * @param {string} modelName - The name of the model to use.
 * @param {string} token - The API token for authentication.
 * @param {string} proxy - The proxy URL.
 * @return {Promise<Array<number>>} A promise that resolves to an array of numbers representing the embedding.
 */
async function getEmbedding(text, modelName, token, proxy) {
	try {
		const data = {
			model: `models/${modelName}`,
			content: {
				parts: [
					{
						text: text,
					},
				],
			},
		};
		agent = new HttpsProxyAgent(proxy);

		const response = await axios({
			method: "post",
			url: `https://generativelanguage.googleapis.com/v1beta/models/embedding-001:embedContent?key=${token}`,
			headers: { "Content-Type": "application/json" },
			data: JSON.stringify(data),
			httpsAgent: agent,
		});

		return response.data.embedding.values;
	} catch (error) {
		console.error("Error getting embedding:", error);
	}
}

module.exports = { getGeminiResponse, getUserIntent, getEmbedding };
