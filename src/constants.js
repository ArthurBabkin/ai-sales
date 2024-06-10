const RESET_MESSAGE = "The chat is reset";
const HELP_MESSAGE = `Hello! I am your sales assistant.
To reset chat history, type /start or /reset
To display this message, type /help`;
const SYSTEM_MESSAGE = `You are sales assistant. 
Your purpose is to help users with buying products enumerated below.
When your client shows their 100% willingness to buy a product, \
return a response of a single word: "SELL".
The following JSON contains all products:`;
const USERS_DB = "users/";
const PRODUCTS_DB = "products/";
const BUYERS_DB = "buyers/"

module.exports = {
  RESET_MESSAGE,
  HELP_MESSAGE,
  SYSTEM_MESSAGE,
  USERS_DB,
  PRODUCTS_DB,
  BUYERS_DB
};
