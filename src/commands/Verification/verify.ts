import {Args, PieceContext} from '@sapphire/framework';
import {Message} from 'discord.js';
import {BediEmbed} from '../../lib/BediEmbed';
import {getSettings} from '../../database/models/SettingsModel';
import {addVerifiedUser, emailAddressLinkedToUser, userVerifiedAnywhereEmailHash, userVerifiedInGuild} from '../../database/models/VerifiedUserModel';
import {addRoleToAuthor} from '../../tests/utils/discordUtil';
import {isEmailValid, sendConfirmationEmail} from '../../utils/emailUtil';
import {addPendingVerificationUser, emailAddressLinkedToPendingVerificationUser} from '../../database/models/PendingVerificationuserModel';
import {hashString} from '../../utils/hashUtil';
import crypto from 'crypto';
import colors from '../../utils/colorUtil';

const {Command} = require('@sapphire/framework');

module.exports = class VerifyCommand extends Command {
  constructor(context: PieceContext) {
    super(context, {
      name: 'verify',
      aliases: ['verification', 'register'],
      description: 'Allows you to verify yourself and access the server',
      preconditions: ['GuildOnly'],
    });
  }

  async run(message: Message, args: Args) {
    const {guild, guildId, author} = message;
    const settingsData = await getSettings(guildId as string);

    await message.delete();

    if (!settingsData.verificationEnabled) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription('Verification is not enabled on this server!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (await userVerifiedInGuild(author.id, guildId as string)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription(`You are already verified! Run ${settingsData.prefix}unverify if necessary.`);
      return message.channel.send({
        embeds: [embed],
      });
    }

    const existingEmailHash = await userVerifiedAnywhereEmailHash(author.id, guildId as string);
    if (existingEmailHash) {
      await addVerifiedUser(author.id, guildId as string, existingEmailHash);
      await addRoleToAuthor(message, settingsData.verifiedRole);
      const embed = new BediEmbed()
          .setTitle('Verify Reply')
          .setDescription('You have been automatically verified!');
      return message.author.send({
        embeds: [embed],
      });
    }

    const emailAddress = await args.pickResult('string');
    if (!emailAddress.success) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription('Invalid Syntax!\n\nMake sure your command is in the format `' + settingsData.prefix + 'verify <emailAddress>`');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (!(isEmailValid(emailAddress.value) && emailAddress.value.endsWith(settingsData.emailDomain))) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription('Invalid Syntax!\n\nMake sure your email is in the format `email@' + settingsData.emailDomain + '`');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (await emailAddressLinkedToUser(emailAddress.value, guildId as string)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription('Invalid Email!\n\nThat email already belongs to a member of this server!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    if (await emailAddressLinkedToPendingVerificationUser(emailAddress.value)) {
      const embed = new BediEmbed()
          .setColor(colors.ERROR)
          .setTitle('Verify Reply')
          .setDescription('Invalid Email!\n\nSomeone is pending verification with that email already!');
      return message.channel.send({
        embeds: [embed],
      });
    }

    const uniqueKey = createUniqueKey();
    await sendConfirmationEmail(emailAddress.value, author.id, guild!.name, settingsData.prefix, uniqueKey);
    await addPendingVerificationUser(author.id, guildId as string, await hashString(emailAddress.value), uniqueKey);

    const embed = new BediEmbed()
        .setTitle('Verify Reply')
        .setDescription(
            'Verification Email Sent to `' + emailAddress.value + '`\nCheck your email and run `' + settingsData.prefix +
            'confirm <uniqueKey>` to complete verification.');
    return message.author.send({
      embeds: [embed],
    });
  }
};

const createUniqueKey = () => {
  return crypto.randomBytes(10).toString('hex');
};