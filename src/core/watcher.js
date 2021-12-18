const _ = require('lodash');
const { Client, MessageEmbed, GuildChannel } = require('discord.js');
const moment = require('moment');
const axios = require('axios').default;
const cache = require('../utils/cache');
const config = require('./config');
const { get, set } = require('./db');
const ethers = require('ethers');

class Watcher {
    /**
     * @param {Client} discordClient
     */
    constructor(discordClient) {
        this.discordClient = discordClient;

        this.startPolling();
    }

    startPolling() {
        setInterval(async () => {
            await this.checkSales();
        }, 60000);
    }

    async checkSales() {
        const collectionSlug = get('collection_slug');
        if (!collectionSlug) return;

        try {
            const lastSaleTime =
                cache.get('lastSaleTime') ??
                moment().startOf('minute').subtract(59, 'seconds').unix();
            console.log(
                `Last sale (in seconds since Unix epoch): ${cache.get(
                    'lastSaleTime'
                )}`
            );

            const resp = await axios.get(
                'https://api.opensea.io/api/v1/events',
                {
                    headers: {
                        'X-API-KEY': config.openseaApiKey,
                    },
                    params: {
                        collection_slug: collectionSlug,
                        event_type: 'successful',
                        occurred_after: lastSaleTime,
                        only_opensea: false,
                    },
                }
            );

            const events = _.get(resp, ['data', 'asset_events']);

            const sortedEvents = _.sortBy(events, function (event) {
                const created = _.get(event, 'created_date');
                return new Date(created);
            });

            const latestEvent = _.last(sortedEvents);

            if (latestEvent) {
                const totalPrice = _.get(latestEvent, 'total_price');

                const tokenDecimals = _.get(latestEvent, [
                    'payment_token',
                    'decimals',
                ]);
                const tokenEthPrice = _.get(latestEvent, [
                    'payment_token',
                    'eth_price',
                ]);

                const formattedUnits = ethers.utils.formatUnits(
                    totalPrice,
                    tokenDecimals
                );
                const formattedEthPrice = formattedUnits * tokenEthPrice;

                await this.discordClient.user.setActivity(
                    `the floor: ${formattedEthPrice} ETH`,
                    {
                        type: 'WATCHING',
                    }
                );
            }

            console.log(`${events.length} sales since the last one.`);

            _.each(sortedEvents, async (event) => {
                const created = _.get(event, 'created_date');

                cache.set('lastSaleTime', created);
                return this.formatAndSendEvent(event);
            });
        } catch (err) {
            console.error(err.message);
        }
    }

    async formatAndSendEvent(event) {
        const guildId = get('guild_id');
        if (!guildId) return;

        const channelId = get('channel_id');
        if (!channelId) return;

        const guild = this.discordClient.guilds.cache.get(guildId);
        if (!guild) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel) return;

        if (!channel.isText()) return;

        const assetName = _.get(
            event,
            ['asset', 'name'],
            _.get(event, ['asset_bundle', 'name'])
        );

        if (!assetName) {
            console.log(`No asset name found for event: ${_.get(event, 'id')}`);
            return;
        }

        const openseaLink =
            _.get(
                event,
                ['asset', 'permalink'],
                _.get(event, ['asset_bundle', 'permalink'])
            ) +
            '?ref=0xc8C75e7d1d55Ab0E01280007EB0CE081926E9eb3&utm_source=alphanft.xyz';
        if (!openseaLink) {
            console.log(
                `No opensea link found for event: ${_.get(event, 'id')}`
            );
            return;
        }

        const imageUrl = _.get(event, ['asset', 'image_url']);
        if (!imageUrl) {
            console.log(`No image url for ${assetName}`);
            return;
        }

        const totalPrice = _.get(event, 'total_price');
        if (!totalPrice) {
            console.log(`No total price for ${assetName}`);
            return;
        }

        const paymentToken = _.get(event, 'payment_token');
        if (!paymentToken) {
            console.log(`No payment token for ${assetName}`);
            return;
        }

        const tokenDecimals = _.get(paymentToken, 'decimals');
        if (!tokenDecimals) {
            console.log(`No token decimals for ${assetName}`);
            return;
        }

        const tokenUsdPrice = _.get(paymentToken, 'usd_price');
        if (!tokenUsdPrice) {
            console.log(`No token usd price for ${assetName}`);
            return;
        }
        const tokenEthPrice = _.get(paymentToken, 'eth_price');
        if (!tokenEthPrice) {
            console.log(`No token eth price for ${assetName}`);
            return;
        }

        const formattedUnits = ethers.utils.formatUnits(
            totalPrice,
            tokenDecimals
        );

        const formattedEthPrice = formattedUnits * tokenEthPrice;
        const formattedUsdPrice = formattedUnits * tokenUsdPrice;

        if (formattedEthPrice === 0) {
            console.log(`Skipping event with 0 ETH price: ${event.id}`);
            return;
        }

        const buyer = _.get(event, 'winner_account');
        const buyerName = _.get(
            buyer,
            ['user', 'username'],
            _.get(buyer, 'address').substring(0, 6) + '...'
        );
        if (!buyerName) {
            console.log(`No buyer name for ${assetName}`);
            return;
        }

        const seller = _.get(event, 'seller');
        const sellerName = _.get(
            seller,
            ['user', 'username'],
            _.get(seller, 'address').substring(0, 6) + '...'
        );
        if (!sellerName) {
            console.log(`No seller name for ${assetName}`);
            return;
        }

        const embed = new MessageEmbed();

        embed
            .setTitle(assetName)
            .setURL(openseaLink)
            .setImage(imageUrl)
            .setDescription(
                `just sold for **${formattedEthPrice} ETH** (*${formattedUsdPrice.toFixed(
                    2
                )} USD*)`
            )
            .addField(
                'Seller',
                `[${sellerName}](https://opensea.io/${sellerName}?ref=0xc8C75e7d1d55Ab0E01280007EB0CE081926E9eb3&utm_source=alphanft.xyz)`,
                true
            )
            .addField(
                'Buyer',
                `[${buyerName}](https://opensea.io/${buyerName}?ref=0xc8C75e7d1d55Ab0E01280007EB0CE081926E9eb3&utm_source=alphanft.xyz)`,
                true
            );

        await channel.send({
            embeds: [embed],
        });
    }
}
module.exports = Watcher;
