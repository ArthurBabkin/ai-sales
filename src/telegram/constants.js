START_MESSAGE = `Hello! I am sales office officer bot. 

I will be listening for updates on user front and send important information to the group. To activate, add me to desired telegram group and type /set_group.
/start or /help to show this message
/set_group to set group
/unset_group to unset group`;

GROUPS_DB = "groups/";
SERVICES_DB = "services/"

module.exports = { START_MESSAGE, GROUPS_DB, SERVICES_DB };
