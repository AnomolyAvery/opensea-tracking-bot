const { Client, Message } = require('discord.js');

const helpCommand = {
    name: 'help',
    aliases: ['h'],
    description:
        'Displays all available commands or info about a specific command.',

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Array<String>} args
     */
    handler: async (client, message, args) => {
        await message.reply('This is a placeholder for the help command.');
    },
};

module.exports = helpCommand;
