const { MessageEmbed } = require('discord.js');

const insufficentEmbed = new MessageEmbed()
    .setTitle('❌ Insufficent Permissions')
    .setDescription(
        'You do not have the required permissions to use this command.'
    )
    .setColor('#ff0000');

module.exports = {
    insufficentEmbed,
};
