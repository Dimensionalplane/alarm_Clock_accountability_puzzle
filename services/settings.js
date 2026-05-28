import { getItem, setItem, deleteItem } from './storage';

const SETTINGS_KEY = 'SNOOZE_TAX_SETTINGS';

const DEFAULT_SETTINGS = {
  penaltyAmount: 1.00,
  difficulty: 'medium', // 'easy', 'medium', 'hard'
  puzzleTimer: 60,
};

export async function getSettings() {
  const settings = await getItem(SETTINGS_KEY);
  return settings ? { ...DEFAULT_SETTINGS, ...JSON.parse(settings) } : DEFAULT_SETTINGS;
}

export async function saveSettings(settings) {
  const currentSettings = await getSettings();
  const newSettings = { ...currentSettings, ...settings };
  await setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  return newSettings;
}
