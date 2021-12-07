const { Client } = require('discord.js');
const moment = require('moment');
const axios = require('axios').default;
const cache = require('../utils/cache');
const config = require('./config');
const Db = require('./db');

class Watcher {
    constructor() {
        const db = new Db(config.storagePath);
        const collectionSlug = db.get('collection_slug') || 'pegz';

        setInterval(() => {
            const lastSaleTime =
                cache.get('lastSaleTime', null) ||
                moment().startOf('minute').subtract(59, 'seconds').unix();

            console.log(
                `Last sale (in seconds since Unix epoch):: ${cache.get(
                    'lastSaleTime',
                    null
                )}`
            );

            axios
                .get('https://api.opensea.io/api/v1/events', {
                    headers: {
                        'X-API-KEY': config.openseaApiKey,
                    },
                    params: {
                        collection_slug: collectionSlug,
                        event_type: 'successful',
                        occurred_after: lastSaleTime,
                        only_opensea: 'false',
                    },
                })
                .then((response) => {
                    const events = _.get(response, ['data', 'asset_events']);

                    const sortedEvents = _.sortBy(events, function (event) {
                        const created = _.get(event, 'created_date');

                        return new Date(created);
                    });

                    console.log(`${events.length} sales since the last one...`);

                    _.each(sortedEvents, (event) => {
                        const created = _.get(event, 'created_date');

                        cache.set('lastSaleTime', moment(created).unix());

                        console.log(event);
                    });
                });
        }, 60000);
    }
}
module.exports = Watcher;
