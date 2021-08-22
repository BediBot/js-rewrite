import {model, Schema} from 'mongoose';
import moment from 'moment-timezone/moment-timezone-utils';
import {getSettings} from './SettingsModel';
import {reqBoolean, reqDate, reqString} from '../../utils/databaseUtil';

interface DueDateI {
  guildId: string,
  title: string,
  dateTime: Date,
  type: string,
  category: string,
  course: string,
  dateOnly: boolean,
}

export const DueDate = new Schema({
  guildId: reqString,
  title: reqString,
  dateTime: reqDate,
  type: reqString,
  category: reqString,
  course: reqString,
  dateOnly: reqBoolean,
}, {versionKey: false});

const dueDateModel = model<DueDateI>('DueDate', DueDate, 'DueDates');

/**
 * Adds a due date
 * @param guildId
 * @param title
 * @param dateTime
 * @param type
 * @param course
 * @returns {Promise<void>}
 * @param category
 * @param dateOnly
 */
export const addDueDate = async (
    guildId: string, title: string, dateTime: Date, type: string, category: string, course: string, dateOnly: boolean) => {
  await dueDateModel.create({
    guildId: guildId,
    title: title,
    dateTime: dateTime,
    type: type,
    category: category,
    course: course,
    dateOnly: dateOnly,
  });
};

/**
 * Removes old due dates in a guild
 * @param guildId
 * @returns {Promise<void>}
 */
export const removeOldDueDatesInGuild = async (guildId: string) => {
  const settingsData = await getSettings(guildId);

  await dueDateModel.deleteMany({
    dateTime: {$lte: moment().toDate()},
    dateOnly: false,
    guildId: guildId,
  });
  await dueDateModel.deleteMany({
    dateTime: {$lte: moment().subtract(1, 'd').toDate()},
    dateOnly: true,
    guildId: guildId,
  });
};

/**
 * Gets all the due dates in a guild for a specific stream and course
 * @param guildId
 * @param stream
 * @param course
 * @return {Promise<Query<Array<EnforceDocument<DueDateI, {}>>, DueDateI & Document<any, any, DueDateI>, {}, DueDateI>>}
 */
export const getDueDatesInGuildForCategoryAndCourse = async (guildId: string, category: string, course: string) => {
  return dueDateModel.find({
    guildId: guildId,
    category: category,
    course: course,
  }).sort({dateTime: 1});
};

export default dueDateModel;