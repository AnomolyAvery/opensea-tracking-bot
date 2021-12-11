const { Client, Message, MessageEmbed } = require('discord.js');

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
        const helpEmbed = new MessageEmbed()
            .setTitle('Help')
            .setColor('#0099ff')
            .setDescription('Here are all the commands you can use.')
            .setFooter('Some footer goes here.');

        const commandFields = [
            {
                name: '!bio',
                value: 'Configure the nickname and profile picture of the bot.',
            },
            {
                name: '!pulse',
                value: 'Get pulse of the selected collection.',
            },
            {
                name: '!setChannel',
                value: 'Set the channel where the bot will post sale notifications.',
            },
        ];

        helpEmbed.addFields(commandFields);

        await message.reply({
            embeds: [helpEmbed],
        });
    },
};

module.exports = helpCommand;
