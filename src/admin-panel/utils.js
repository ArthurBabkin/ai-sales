const { checkSession } = require("./database");

/**
 * Checks the authentication status of a request.
 *
 * @param {Object} req - The request object.
 * @param {Object} database - The database object.
 * @return {Promise<boolean>} A Promise that resolves to a boolean indicating the authentication status.
 */
async function checkReqAuth(req, database) {
	const username = req.cookies.username;
	const sessionId = req.cookies.sessionId;
	const auth = await checkSession(username, sessionId, database);
	return auth;
}

module.exports = { checkReqAuth };
