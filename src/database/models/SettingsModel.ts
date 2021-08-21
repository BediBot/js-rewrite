import {model, Schema} from 'mongoose';

interface SettingsI {
  _id: string, // Guild ID
  prefix: string,
  timezone: string,

  pinsEnabled: boolean,
  pinEmoji: string,

  quotesEnabled: boolean,
  quoteApprovalsRequired: number,

  verificationEnabled: boolean,
  emailDomain: string,
  verifiedRole: string,

  dueDatesEnabled: boolean,
  types: string[],
  categories: string[],
  courses: string[],
}

export const Settings = new Schema({
  _id: String, // Guild ID
  prefix: String,
  timezone: String,

  pinsEnabled: Boolean,
  pinEmoji: String,

  quotesEnabled: Boolean,
  quoteApprovalsRequired: Number,

  verificationEnabled: Boolean,
  emailDomain: String,
  verifiedRole: String,

  dueDatesEnabled: Boolean,
  types: [String],
  categories: [String],
  courses: [String],
});

export const defaultSettings = (guildID: string) => {
  return {
    _id: guildID,
    prefix: '$',
    timezone: 'America/Toronto',

    pinsEnabled: true,
    pinEmoji: '📌',

    quotesEnabled: true,
    quoteApprovalsRequired: 4,

    verificationEnabled: false,
    emailDomain: 'uwaterloo.ca',
    verifiedRole: 'Verified',

    dueDatesEnabled: true,
    types: ['Assignment', 'Test', 'Quiz', 'Exam', 'Project', 'Other'],
    categories: ['Stream 8'],
    courses: [],
  };
};

const settingsModel = model<SettingsI>('Settings', Settings, 'Settings');

/**
 * Gets the settings for a given guild
 * @param guildId
 * @returns {Promise<SettingsI & Document<any, any, SettingsI>>}
 */
export const getSettings = async (guildId: string) => {
  let settingsData = await settingsModel.findOne({_id: guildId});

  return settingsData ?? await settingsModel.create(defaultSettings(guildId as string));
};

export default settingsModel;

