const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

async function getGeminiResponse(
  messages,
  modelName,
  token,
  proxy,
  systemMessage = null
) {
  newMessages = messages;
  if (systemMessage != null) {
    newMessages = [{ role: "user", content: systemMessage }].concat(messages);
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

async function getUserIntent(
  messages,
  intents,
  prompt,
  modelName,
  token,
  proxy
) {
  const message =
    `${prompt}\nIntents:\n${JSON.stringify(intents)}\nDialogue:\n${JSON.stringify(messages)}`;
  result = await getGeminiResponse(
    [{ role: "user", content: message }],
    modelName,
    token,
    proxy
  );
  return result;
}

module.exports = { getGeminiResponse, getUserIntent };
