/**
 * Squeezes messages by truncating sequences and long messages to a specified length.
 *
 * @param {Array} messages - The array of messages to squeeze.
 * @param {number} maxSequenceLength - The maximum number of messages to keep.
 * @param {number} maxMessageLength - The maximum length of a message before truncation.
 * @return {Array} The squeezed array of messages.
 */
function squeezeMessages(
	messages,
	maxSequenceLength = 30,
	maxMessageLength = 500,
) {
	newMessages = messages.slice(-maxSequenceLength);
	for (i = 0; i < newMessages.length; i++) {
		content = newMessages[i].content;
		if (content.length > maxMessageLength) {
			newMessages[i].content =
				`${content.substring(content.length - maxMessageLength)}...`;
		}
	}
	return newMessages;
}

/**
 * Checks if the given message and intent response contain certain keywords and returns the corresponding intent.
 *
 * @param {string} messageResponse - The response to the message.
 * @param {string} intentResponse - The response to the intent.
 * @param {Array<Object>} intents - An array of intents.
 * @return {string|null} The found intent or null if no intent is found.
 */
function checkTrigger(intentResponse, intents) {
	foundIntent = null;
	for (let i = 0; i < intents.length; i++) {
		const intent = intents[i];
		if (intentResponse.toLowerCase().includes(intent.name.toLowerCase())) {
			foundIntent = intent;
			break;
		}
	}

	return foundIntent;
}

/**
 * Validates the userId based on the regex pattern and returns a sanitized version if needed.
 *
 * @param {string} userId - The user ID to validate and sanitize
 * @return {string} The sanitized user ID
 */
function getUserId(userId) {
	const regex = /^[A-Za-z0-9]+$/;
	if (!regex.test(userId)) {
		const index = userId.search(/[^A-Za-z0-9]/);
		if (index !== -1) {
			return userId.substring(0, index);
		}
	}
	return userId;
}


module.exports = { squeezeMessages, checkTrigger, getUserId };
