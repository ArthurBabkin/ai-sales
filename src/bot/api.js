const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

async function getGeminiResponse(
  messages,
  modelName,
  token,
  proxy,
  systemMessage = null
) {
  if (systemMessage != null) {
    messages = [{ role: "user", content: systemMessage }].concat(messages);
  }
  geminiMessages = [];
  map = {
    user: "user",
    assistant: "model",
  };
  for (i = 0; i < messages.length; i++) {
    geminiMessages.push({
      role: map[messages[i]["role"]],
      parts: [{ text: messages[i]["content"] }],
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

async function getUserIntent(
  messages,
  intents,
  prompt,
  modelName,
  token,
  proxy
) {
  prompt =
    prompt +
    "\nIntents:\n" +
    JSON.stringify(intents) +
    "\nDialogue:\n" +
    JSON.stringify(messages)
  result = await getGeminiResponse(
    [{ role: "user", content: prompt }],
    modelName,
    token,
    proxy
  );
  return result;
}

module.exports = { getGeminiResponse, getUserIntent };
