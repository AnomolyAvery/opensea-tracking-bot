const {
    Client,
    Interaction,
    MessageEmbed,
    MessageReaction,
    User,
} = require('discord.js');
const config = require('../core/config');
const db = require('../core/db');
const Db = require('../core/db');
const setup = require('../utils/setup');
const { getCollectionSlug } = require('../utils/setup');

const interactionCreate = {
    name: 'interactionCreate',

    /**
     *
     * @param {Client} client
     * @param {Interaction} interaction
     */
    handler: async (client, interaction) => {
        if (!interaction.isButton()) return;

        if (interaction.customId === 'start-setup') {
            const { network, collectionSlug } = await setup.setup(interaction);
            console.log(`Setup started for ${network}/${collectionSlug}`);

            db.set('network', network);
            db.set('collection_slug', collectionSlug);

            await interaction.channel.send('Setup complete!');
        }
    },
};

module.exports = interactionCreate;
