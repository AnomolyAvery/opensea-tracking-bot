const { Message, Client } = require('discord.js');
const { getCommands } = require('../commands');
const config = require('../core/config');

const messageCreate = {
    name: 'messageCreate',

    /**
     *
     * @param {Client} client
     * @param {Message} message
     */
    handler: async (client, message) => {
        const commands = getCommands();
        const prefix = config.prefix;

        if (message.author.bot) return;
        if (!message.content.startsWith(prefix)) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        // Check if command exists via name or alias
        const cmd = commands.find(
            (c) => c.name === command || c.aliases.includes(command)
        );
        if (!cmd) return;

        cmd.handler(client, message, args);
    },
};

module.exports = messageCreate;
