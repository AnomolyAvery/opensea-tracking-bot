const path = require('path');
const fs = require('fs');

const events = [];

const getEvent = (eventName) => {
    return events.find((x) => x.name === eventName);
};

const getEvents = () => {
    return events;
};

const init = () => {
    const eventsDir = path.join(__dirname, './');

    fs.readdirSync(eventsDir).forEach((file) => {
        if (file.endsWith('.js') && file !== 'index.js') {
            const event = require(path.join(eventsDir, file));
            events.push(event);
        }
    });
};

init();

module.exports = {
    getEvent,
    getEvents,
};
