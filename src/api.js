const request = require("request");

function get_llm_response(messages, url, token, model_name, system_message) {
  const options = {
    url: url,
    method: "POST",
    json: true,
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: {
      model: model_name,
      messages: [{ role: "system", content: system_message }].concat(messages),
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

module.exports = { get_llm_response };
