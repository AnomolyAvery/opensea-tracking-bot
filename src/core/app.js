const Discord = require('discord.js');
const cron = require('node-cron');
const { getEvents } = require('../events');

const config = require('./config');

class App {
    /**
     *
     * @param {Discord.Client} discordClient
     */
    constructor(discordClient) {
        this.discordClient = discordClient;
    }

    async start() {
        this.initEvents();
        await this.discordClient.login(config.token);
    }

    initEvents() {
        const events = getEvents();
        events.forEach((event) => {
            this.discordClient.on(event.name, (...args) =>
                event.handler(this.discordClient, ...args)
            );
        });
    }
}
module.exports = App;
