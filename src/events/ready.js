const { Client } = require('discord.js');

const readyEvent = {
    name: 'ready',
    /**
     *
     * @param {Client} client
     */
    handler: (client) => {
        console.log(`Logged in as ${client.user.tag}!`);
    },
};

module.exports = readyEvent;
