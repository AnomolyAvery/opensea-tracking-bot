const path = require('path');
const fs = require('fs');

const commands = [];

const getCommands = () => commands;

const getCommandByName = (name) =>
    commands.find((command) => command.name === name);

const getCommandByAlias = (alias) =>
    commands.find((command) => command.aliases.includes(alias));

const init = () => {
    const commandsDir = path.join(__dirname, './');

    fs.readdirSync(commandsDir).forEach((file) => {
        if (file.endsWith('.js') && file !== 'index.js') {
            const command = require(`./${file}`);
            commands.push(command);
        }
    });
};

init();

module.exports = {
    getCommands,
    getCommandByName,
    getCommandByAlias,
};
