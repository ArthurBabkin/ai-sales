const request = require("request");

function getLLMResponse(messages, url, token, modelName, systemMessage = null) {
  if (systemMessage != null) {
    messages = [{ role: "system", content: systemMessage }].concat(messages);
  }
  const options = {
    url: url,
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: {
      model: modelName,
      messages: messages,
    },
  };

  return new Promise((resolve, reject) => {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(body.choices[0].message.content);
      }
    });
  });
}

async function getUserIntent(
  products,
  messages,
  intents,
  prompt,
  url,
  token,
  modelName
) {
  prompt =
    prompt +
    "\nIntents:\n" +
    JSON.stringify(intents) + 
    "\nDialogue:\n" +
    JSON.stringify(messages) +
    "\nList of products:\n" +
    JSON.stringify(products);
  result = await getLLMResponse(
    [{ role: "user", content: prompt }],
    url,
    token,
    modelName
  );
  return result;
}
module.exports = { getLLMResponse, getUserIntent };
