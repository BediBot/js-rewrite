import {Message, Role} from 'discord.js';
import logger from './loggerUtil';
import {getSettings} from '../database/models/SettingsModel';

export const addRoleToAuthor = async (message: Message, roleName: string) => {
  const {guild, member} = message;

  if (!guild) {
    logger.warn('addRoleToAuthor called from message without guild');
    return;
  }

  const role = guild.roles.cache.find(role => role.name === roleName);

  if (!role) {
    logger.warn('Attempted to add role that does not exist');
    return;
  }

  try {
    await member!.roles.add(role as Role);
  } catch (error) {
    logger.error(error);
  }
};

export const fetchPrefix = async (message: Message) => {
  const {guildId} = message;

  const guildPrefix = (await getSettings(guildId as string)).prefix;

  return guildPrefix ?? '$';
};