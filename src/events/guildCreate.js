const {
    Client,
    Guild,
    MessageEmbed,
    MessageActionRow,
    MessageButton,
} = require('discord.js');
const config = require('../core/config');
const { set } = require('../core/db');

const guildCreate = {
    name: 'guildCreate',

    /**
     *
     * @param {Client} client
     * @param {Guild} guild
     */
    handler: async (client, guild) => {
        //Find or create "tracking-config" text channel
        let trackingConfig = guild.channels.cache.find(
            (channel) =>
                channel.name === 'tracking-config' &&
                channel.isText() &&
                !channel.isThread()
        );
        if (!trackingConfig) {
            trackingConfig = await guild.channels.create('tracking-config', {
                type: 'text',
                permissionOverwrites: [
                    {
                        id: guild.roles.everyone,
                        deny: ['VIEW_CHANNEL'],
                    },
                ],
            });
        }

        //ensure channel is text channel
        if (!trackingConfig.isText()) {
            return;
        }

        set('config_channel_id', trackingConfig.id);

        const welcomeMessage = config.welcomeMessage.description;

        await trackingConfig.send(welcomeMessage);
    },
};

module.exports = guildCreate;
