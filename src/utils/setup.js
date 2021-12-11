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

/**
 *
 * @param {ButtonInteraction} interaction
 */
const networkQuestion = async (interaction) => {
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
 * @param {ButtonInteraction} interaction
 */
const collectionSlugQuestion = async (interaction) => {
    const channel = interaction.channel;

    if (!channel.isText()) return;

    const questionMessage = await channel.send(
        'Please enter the collection slug you would like to interact with.'
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
const setup = async (interaction) => {
    if (!interaction.isButton()) return;

    await interaction.reply('Please wait...');
    const selectedNetwork = await networkQuestion(interaction);
    const selectedSlug = await collectionSlugQuestion(interaction);

    return {
        network: selectedNetwork,
        collectionSlug: selectedSlug,
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
    setup,
    setupReview,
};
