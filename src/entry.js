const Discord = require('discord.js');
const App = require('./core/app');
const Watcher = require('./core/watcher');

(async function () {
    const client = new Discord.Client({
        intents: [
            Discord.Intents.FLAGS.GUILDS,
            Discord.Intents.FLAGS.GUILD_MESSAGES,
        ],
    });
    const app = new App(client);
    const watcher = new Watcher(client);

    await app.start();
})();
