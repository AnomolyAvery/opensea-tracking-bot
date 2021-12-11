const { Client, Message, MessageEmbed } = require('discord.js');
const { insufficentEmbed } = require('../utils/embeds');
const { captilizeFirstChar } = require('../utils/string');

const bioCommand = {
    name: 'bio',
    aliases: ['botbio'],
    description: "Sets the bot's bio.",

    /**
     *
     * @param {Client} client
     * @param {Message} message
     * @param {Array<string>} args
     */
    handler: async (client, message, args) => {
        const { member, channel, guild } = message;

        const hasPermission = member.permissions.has('ADMINISTRATOR');
        if (!hasPermission) {
            return message.channel.send({
                embeds: [insufficentEmbed],
            });
        }

        const botNicknameQuestion = async () => {
            const nicknameEmbed = new MessageEmbed()
                .setTitle('Nickname')
                .setDescription("What would you like bot's nickname to be?")
                .setColor('#0099ff');
            const message = await channel.send({
                embeds: [nicknameEmbed],
            });

            const filter = (m) => m.author.id === member.id;

            const collected = await channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
            });

            if (!collected.size) {
                return message.edit('No nickname was provided. Cancelling...');
            }

            const nickname = collected.first().content;

            await collected.first().delete();

            return {
                name: 'nickname',
                value: nickname,
                message: message,
            };
        };

        const profilePictureQuestion = async () => {
            const profilePictureEmbed = new MessageEmbed()
                .setTitle('Profile Picture')
                .setDescription(
                    "What would you like bot's profile picture to be? (Upload an image)"
                )
                .setColor('#0099ff');
            const message = await channel.send({
                embeds: [profilePictureEmbed],
            });

            const filter = (m) => m.author.id === member.id;

            const collected = await channel.awaitMessages({
                filter,
                max: 1,
                time: 30000,
            });

            if (!collected.size) {
                return message.edit(
                    'No profile picture was provided. Cancelling...'
                );
            }

            if (collected.first().attachments.size === 0) {
                return message.edit(
                    'No profile picture was provided. Cancelling...'
                );
            }

            const profilePicture = collected.first().attachments.first().url;

            await collected.first().delete();

            return {
                name: 'Profile Picture',
                value: profilePicture,
                message: message,
            };
        };

        const nickname = await botNicknameQuestion();
        const profilePicture = await profilePictureQuestion();

        await nickname.message.delete();
        await profilePicture.message.delete();

        await guild.me.setNickname(nickname.value);

        await client.user.setAvatar(profilePicture.value);

        const completeEmbed = new MessageEmbed()
            .setTitle('Bio')
            .setDescription(`The bot's bio has been updated.`)
            .setColor('#0099ff')
            .setImage(profilePicture.value)
            .setFields([
                { name: 'Nickname', value: nickname.value, inline: true },
                { name: 'Profile Picture', value: '*Below*', inline: true },
            ]);

        const response = await message.channel.send({
            embeds: [completeEmbed],
        });

        setTimeout(() => response.delete(), 5000);
    },
};

module.exports = bioCommand;
