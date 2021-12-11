const { Client, Message } = require('discord.js');
const config = require('../core/config');
const { set, save } = require('../core/db');

const setChannelCommand = {
    name: 'setchannel',
    aliases: ['setchan'],
    description: 'Set the channel for the bot to post in.',

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Array<String>} args
     */
    handler: async (client, message, args) => {
        const channel = message.mentions.channels.first();
        if (!channel || !channel.isText()) {
            return message.reply('Please mention a text-channel.');
        }

        set('guild_id', message.guildId);
        set('channel_id', channel.id);
        save();

        return message.reply(
            `You will now recieve alerts for new sales in: <#${channel.id}>`
        );
    },
};

module.exports = setChannelCommand;
