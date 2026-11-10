import { NOTIFY_ROWS } from '../constants'

export const settingsSections = (accountType: 'PERSONAL' | 'EMPLOYER' | undefined) => {
  const personal = accountType !== 'EMPLOYER'
  return {
    notify: NOTIFY_ROWS.filter((row) => personal || !row.personal),
    hub: personal,
    subscriptionNote: personal,
  }
}
