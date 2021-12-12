const { Client, Message } = require('discord.js');
const setup = require('../utils/setup');

const setupCommand = {
    name: 'setup',
    aliases: [],
    description: 'Setup the bot',

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Array<string>} args
     */
    handler: async (client, message, args) => {
        await setup(message);
    },
};

module.exports = setupCommand;
