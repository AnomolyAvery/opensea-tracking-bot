require('dotenv').config();

module.exports = {
    prefix: process.env.PREFIX || '!',
    token: process.env.TOKEN,
    pollInterval: process.env.POLL_INTERVAL || '*/1 * * * *',
    pollTimezone: process.env.POLL_TIMEZONE || 'America/New_York',
    openseaApiKey: process.env.OPENSEA_API_KEY,
    storagePath:
        process.env.STORAGE_PATH ||
        path.join(__dirname, '../../storage/db-1.json'),
};
