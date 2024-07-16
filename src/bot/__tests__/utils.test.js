const { checkTrigger, squeezeMessages } = require("../utils");

test("checkTrigger", () => {
	const intentResponse = "purchase";
	const intents = [
		{
			name: "purchase",
		},
	];
	expect(checkTrigger(intentResponse, intents).name).toBe(
		"purchase",
	);

	const intentResponse2 = "purchase";
	const intents2 = [
		{
			name: "manager",
		},
	];
	expect(checkTrigger(intentResponse2, intents2)).toBe(null);

	const intentResponse3 = "manager";
	const intents3 = [
		{
			name: "manager",
		},
	];
	expect(checkTrigger(intentResponse3, intents3).name).toBe(
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
