import { commonStorage } from 'balance-common';

/**
 * @desc get suppress reminder ribbon setting
 * @return {Boolean}
 */
export const getSupressReminderRibbon = async () => {
  const reminderRibbon = await commonStorage.getLocal('supressreminderribbon');
  return reminderRibbon ? reminderRibbon.data : null;
};

/**
 * @desc save suppress reminder ribbon setting
 * @param  {Boolean}   [supress state]
 */
export const saveSupressReminderRibbon = async state => {
  await commonStorage.saveLocal('supressreminderribbon', { data: state });
};
