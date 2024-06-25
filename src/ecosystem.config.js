module.exports = {
  apps: [
    {
      name: "bot",
      script: "./src/bot/main.js",
    },
    {
      name: "admin_panel",
      script: "./src/admin-panel/server.js",
    },
    {
      name: "telegram",
      script: "./src/telegram/main.js",
    }
  ],
};
