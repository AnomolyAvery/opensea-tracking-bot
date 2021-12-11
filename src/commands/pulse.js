const { Client, Message, MessageEmbed } = require('discord.js');
const axios = require('axios').default;
const { get } = require('../core/db');
const config = require('../core/config');
const { getEthPriceNow } = require('get-eth-price');
const ethers = require('ethers');

const pulseCommand = {
    name: 'pulse',
    aliases: [''],
    description: 'Pulse the collection on the server.',

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Array<string>} args
     */
    handler: async (client, message, args) => {
        const collectionSlug = get('collection_slug');
        const configChannelId = get('config_channel_id');
        if (!collectionSlug) {
            return message.channel.send(
                `No collection is currently active. Please setup in the <#${configChannelId}>`
            );
        }

        try {
            const resp = await axios.get(
                `https://api.opensea.io/api/v1/collection/${collectionSlug}`,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-API-KEY': config.openseaApiKey,
                    },
                }
            );
            const collection = resp.data.collection;

            if (!collection) {
                return message.channel.send(
                    'There was an error fetching the collection.'
                );
            }

            const embed = new MessageEmbed();

            if (collection.image_url) {
                embed.setThumbnail(collection.image_url);
            }

            const paymentToken = collection.payment_tokens.find(
                (x) => x.symbol === 'ETH'
            );

            const totalPrice = collection.stats.floor_price;

            const tokenDecimals = paymentToken.decimals;

            const tokenEthPrice = paymentToken.eth_price;
            const tokenUsdPrice = paymentToken.usd_price;

            const usdPrice = totalPrice * tokenUsdPrice;

            const fields = [
                {
                    name: 'Owners',
                    value: `${collection.stats.num_owners}`,
                    inline: true,
                },
                {
                    name: 'Total',
                    value: `${collection.stats.count}`,
                    inline: true,
                },
                {
                    name: 'Listed',
                    value: `${collection.stats.total_supply}`,
                    inline: true,
                },
                {
                    name: 'Floor Price',
                    value: `${totalPrice} ETH ( $${usdPrice.toFixed(2)} USD )`,
                },
                {
                    name: 'Past Day',
                    value: `${collection.stats.one_day_sales}`,
                },
                {
                    name: 'Past Week',
                    value: `${collection.stats.seven_day_sales}`,
                },
                {
                    name: 'All Time',
                    value: `${collection.stats.total_sales}`,
                },
                {
                    name: 'All Time Highest Sale',
                    value: `${collection.stats.market_cap} ETH`,
                },
            ];

            embed
                .setTitle(`${collection.name} Market Pulse`)
                .setDescription('Weeee stats!')
                .setFields(fields);
            await message.channel.send({
                embeds: [embed],
            });
        } catch (err) {
            console.error(err);
            return message.channel.send(
                'There was an error fetching the collection.'
            );
        }
    },
};

module.exports = pulseCommand;
