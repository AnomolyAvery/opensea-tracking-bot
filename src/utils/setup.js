const { TextChannel, Message, MessageEmbed } = require('discord.js');
const db = require('../core/db');

/**
 *
 * @param {Message} message
 * @param {Object} question
 * @param {string} question.text
 * @param {string} question.valueType
 * @param {Array<string>} validAnswers
 */
const getAnswer = async (message, question, validAnswers = []) => {
    const response = await message.channel.awaitMessages({
        max: 1,
        time: 30000,
        filter: (m) => m.author.id === message.author.id,
    });
    const answer = response.first().content;

    if (
        validAnswers.length > 0 &&
        !validAnswers.map((x) => x.toLowerCase()).includes(answer.toLowerCase())
    ) {
        return await askQuestion(message, question, validAnswers);
    }

    //Cast answer to valueType
    switch (question.valueType) {
        case 'number':
            return Number(answer);
        case 'string':
            return answer;
        default:
            return answer;
    }
};

/**
 *
 * @param {Message} message
 */
const setup = async (message) => {
    const questions = [
        {
            text: '1. What network is your NFT collection on?',
            valueType: 'string',
            validAnswers: ['Ethereum', 'Solana', 'Eth', 'Sol'],
        },
        {
            text: 'Please paste your Smart Contract address in below',
            valueType: 'string',
            validAnswers: [],
        },
        {
            text: 'Please paste your OpenSea collection URL Slug [example slug: opensea.io/URL-Slug]',
            valueType: 'string',
            validAnswers: [],
        },
        {
            text: "1. Please enter your official Collection title exactly as you'd like it to appear:",
            valueType: 'string',
            validAnswers: [],
        },
        {
            text: 'Which discord channel do you want sales posted? Just mention the channel to reply.',
            valueType: 'string',
            validAnswers: [],
        },
    ];

    const answers = [];

    for (let i = 0; i < questions.length; i++) {
        const questionEmbed = new MessageEmbed()
            .setTitle('Setup - Question ' + (i + 1))
            .setDescription(questions[i].text)
            .addFields(
                questions[i].validAnswers.map((x) => ({
                    name: x,
                    value: '✅',
                    inline: true,
                }))
            )
            .setColor('#0099ff');
        await message.channel.send({
            embeds: [questionEmbed],
        });
        answers.push(
            await getAnswer(message, questions[i], questions[i].validAnswers)
        );
    }

    /**
     * @type {Array<string>}
     * @property {string} network
     * @property {string} contractAddress
     * @property {string} collectionUrlSlug
     * @property {string} collectionTitle
     * @property {string} salesChannel
     */
    const [
        network,
        contractAddress,
        collectionSlug,
        collectionTitle,
        salesChannel,
    ] = answers;

    db.set('collection_slug', collectionSlug);
    db.set('collection_title', collectionTitle);
    db.set('contract_address', contractAddress);
    db.set('network', network);
    db.set('channel_id', salesChannel.replace(/[<#>]/g, ''));
    db.set('guild_id', message.guildId);
    db.save();

    const completedEmbed = new MessageEmbed()
        .setTitle('Setup Complete')
        .setDescription(
            `Your NFT collection has been setup!\n\n` +
                `**Network:** ${network}\n` +
                `**Contract Address:** ${contractAddress}\n` +
                `**Collection Slug:** ${collectionSlug}\n` +
                `**Collection Title:** ${collectionTitle}\n` +
                `**Sales Channel:** ${salesChannel}\n`
        )
        .setColor('#00ff00');

    await message.channel.send({
        embeds: [completedEmbed],
    });
};

module.exports = setup;
