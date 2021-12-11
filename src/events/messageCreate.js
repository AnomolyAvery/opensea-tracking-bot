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

        //Check if alias exists

        let cmd = commands.find((c) => c.name === command);

        if (!cmd) {
            const aliases = commands.filter((c) => {
                if (c.aliases) {
                    return c.aliases.includes(command);
                }
                return false;
            });

            if (aliases.length === 0) return;

            cmd = aliases[0];
        }

        await cmd.handler(client, message, args);
        await message.delete();
    },
};

module.exports = messageCreate;
