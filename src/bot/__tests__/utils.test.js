const { checkTrigger, squeezeMessages } = require("../utils");

test("checkTrigger", () => {
	const messageResponse = "Thank you for your purchase";
	const intentResponse = "purchase";
	const intents = [
		{
			name: "purchase",
		},
	];
	expect(checkTrigger(messageResponse, intentResponse, intents)).toBe(
		"purchase",
	);

	const messageResponse2 = "Thank you";
	const intentResponse2 = "purchase";
	const intents2 = [
		{
			name: "manager",
		},
	];
	expect(checkTrigger(messageResponse2, intentResponse2, intents2)).toBe(null);

	const messageResponse3 = "Hello";
	const intentResponse3 = "manager";
	const intents3 = [
		{
			name: "manager",
		},
	];
	expect(checkTrigger(messageResponse3, intentResponse3, intents3)).toBe(
		"manager",
	);
});

test("squeezeMessages", () => {
	const messages = [
		{
			role: "user",
			content: "Hello",
		},
		{
			role: "assistant",
			content: "Hi",
		},
	];
	expect(squeezeMessages(messages)).toEqual(messages);

  const messages2 = []
  for (i = 0; i < 20; i++) {
    messages2.push({
      role: "user",
      content: "message",
    });
    messages2.push({
      role: "assistant",
      content: "message",
    });
  }

  expect(squeezeMessages(messages2)).toEqual(messages2.slice(-30));

  const messages3 = [
    {
      role: "user",
      content: "message".repeat(500),
    },
    {
      role: "assistant",
      content: "message",
    },
  ]

  expect(squeezeMessages(messages3)[0].content.length).toEqual(500 + 3);
});
