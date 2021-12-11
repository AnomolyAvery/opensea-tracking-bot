const {
    Channel,
    TextChannel,
    Interaction,
    Message,
    ButtonInteraction,
    MessageEmbed,
    MessageReaction,
    User,
    GuildMember,
} = require('discord.js');
const db = require('../core/db');

/**
 *
 * @param {Message} message
 */
const networkQuestionMessage = async (message) => {
    const channel = message.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please enter the network you would like to interact with. (1. ETH)'
    );

    const networkMessages = await channel.awaitMessages({
        max: 1,
        filter: (m) => m.author.id === interaction.user.id,
    });

    const selectedNetwork = networkMessages.first().content;
    if (selectedNetwork != '1') {
        await questionMessage.delete();
        networkMessages.forEach(async (m) => {
            if (!m || m.deleted || !m.deletable) {
                return;
            }

            await m.delete();
        });
        return await networkQuestionMessage(message);
    }

    await questionMessage.delete();

    networkMessages.forEach(async (m) => await m.delete());

    return selectedNetwork;
};

/**
 *
 * @param {ButtonInteraction} interaction
 */
const networkQuestionInteraction = async (interaction) => {
    //This removes the "Please wait..." message in the beginning

    // Check if reply is already deleted
    try {
        const intReply = await interaction.fetchReply();
        if (!intReply.deleted) {
            await interaction.deleteReply();
        }
    } catch (e) {
        if (e.message !== 'Unknown Message') {
            throw e;
        }
    }

    const channel = interaction.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please enter the network you would like to interact with. (1. ETH)'
    );

    const networkMessages = await channel.awaitMessages({
        max: 1,
        filter: (m) => m.author.id === interaction.user.id,
    });

    const selectedNetwork = networkMessages.first().content;
    if (selectedNetwork != '1') {
        await questionMessage.delete();
        networkMessages.forEach(async (m) => {
            if (!m || m.deleted || !m.deletable) {
                return;
            }

            await m.delete();
        });
        return await networkQuestion(interaction);
    }

    await questionMessage.delete();

    networkMessages.forEach(async (m) => await m.delete());

    return selectedNetwork;
};

/**
 *
 * @param {Message} Message
 */
const smartContractQuestionMessage = async (message) => {
    const channel = message.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please paste your Smart Contract address in below'
    );

    const smartContractMessages = await channel.awaitMessages({
        max: 1,
        filter: (m) => m.author.id === interaction.user.id,
    });

    const smartContractAdd = smartContractMessages.first().content;

    db.set('smart_contract', smartContractAdd);

    await questionMessage.delete();

    smartContractMessages.forEach(async (m) => await m.delete());

    return smartContractAdd;
};

/**
 *
 * @param {ButtonInteraction} interaction
 */
const smartContractQuestionInteraction = async (interaction) => {
    const channel = interaction.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please paste your Smart Contract address in below'
    );

    const smartContractMessages = await channel.awaitMessages({
        max: 1,
        filter: (m) => m.author.id === interaction.user.id,
    });

    const smartContractAdd = smartContractMessages.first().content;

    db.set('smart_contract', smartContractAdd);

    await questionMessage.delete();

    smartContractMessages.forEach(async (m) => await m.delete());

    return smartContractAdd;
};

/**
 *
 * @param {Message} message
 */
const collectionSlugQuestionMessage = async (message) => {
    const channel = message.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please paste your OpenSea collection URL Slug [example slug: opensea.io/URL-Slug]:'
    );

    const collectionSlugMessages = await channel.awaitMessages({
        filter: (m) => m.author.id === interaction.user.id,
        time: 60000,
        max: 1,
        errors: ['time'],
    });

    const selectedCollectionSlug = collectionSlugMessages.first().content;

    await questionMessage.delete();

    collectionSlugMessages.forEach(async (m) => await m.delete());

    return selectedCollectionSlug;
};

/**
 *
 * @param {ButtonInteraction} interaction
 */
const collectionSlugQuestionInteraction = async (interaction) => {
    const channel = interaction.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please paste your OpenSea collection URL Slug [example slug: opensea.io/URL-Slug]:'
    );

    const collectionSlugMessages = await channel.awaitMessages({
        filter: (m) => m.author.id === interaction.user.id,
        time: 60000,
        max: 1,
        errors: ['time'],
    });

    const selectedCollectionSlug = collectionSlugMessages.first().content;

    await questionMessage.delete();

    collectionSlugMessages.forEach(async (m) => await m.delete());

    return selectedCollectionSlug;
};

/**
 *
 * @param {ButtonInteraction} interaction
 * @returns
 */
const setupInteraction = async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.reply('Please wait...');
    const selectedNetwork = await networkQuestion(interaction);
    const selectedSlug = await collectionSlugQuestion(interaction);
    const smartContractAdd = await smartContractQuestion(interaction);

    return {
        network: selectedNetwork,
        collectionSlug: selectedSlug,
        smartContract: smartContractAdd,
    };
};

/**
 *
 * @param {Message} message
 */
const setupMessage = async (message) => {
    await message.reply('Please wait...');
    const selectedNetwork = await networkQuestionMessage(message);
    const selectedSlug = await collectionSlugQuestionMessage(message);
    const smartContractAdd = await smartContractQuestionMessage(message);

    return {
        network: selectedNetwork,
        collectionSlug: selectedSlug,
        smartContract: smartContractAdd,
    };
};

/**
 *
 * @param {TextChannel} channel
 * @param {User} watchedUser
 * @param {Array<Object>} setupFields
 */
const setupReview = async (channel, watchedUser, setupFields) => {
    const reviewEmbed = new MessageEmbed();

    reviewEmbed.setTitle('Setup Review');
    reviewEmbed.setDescription('Please review the setup below.');
    setupFields.forEach((_) => reviewEmbed.addField(_.name, _.value));

    const message = await channel.send({
        embeds: [reviewEmbed],
    });

    // Add reactions
    await message.react('✅');
    await message.react('❌');

    const filter = (reaction, user) => {
        return (
            ['✅', '❌'].includes(reaction.emoji.name) &&
            user.id === watchedUser.id
        );
    };

    try {
        const reaction = await message.awaitReactions({
            filter,
            max: 1,
            time: 60000,
            errors: ['time'],
        });

        const reactionEmoji = reaction.first().emoji.name;

        if (reactionEmoji === '✅') {
            console.log('Setup accepted');
            await message.delete();
            return true;
        }
    } catch (err) {
        console.log(`Setup review timed out: ${err}`);
        //Do nothing right now.
    }

    console.log('Setup cancelled');
    await message.delete();
    return false;
};

module.exports = {
    setupInteraction,
    setupMessage,
    setupReview,
};
