const { Client, Guild } = require('discord.js');

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
            (channel) => channel.name === 'tracking-config'
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

        
    },
};

module.exports = guildCreate;
