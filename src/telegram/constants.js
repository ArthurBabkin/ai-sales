START_MESSAGE = `Hello! 🤗
I will assist you tracking your clients activating triggers and keeping track of your work. 😈
To begin our work, add me to the admin group, and type /set_group ✊

/start or /help displays this message ⚡️
/set_group adds tracking functionality to current chat 🦄
/unset_group removes tracking functionality from current chat 💪
/leader_board displays top managers with max clients served 😵‍💫
/reset_leader_board resets leader board 🍉`;

GROUPS_DB = "groups/";
SERVICES_DB = "services/"
ONGOING_SERVICES_DB = "ongoing_services/"

SERVICE_TIMEOUT = 10 * 60 * 1000;

module.exports = { START_MESSAGE, GROUPS_DB, SERVICES_DB, ONGOING_SERVICES_DB, SERVICE_TIMEOUT };
