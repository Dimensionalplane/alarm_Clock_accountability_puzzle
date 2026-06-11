import { getItem, setItem, deleteItem } from './storage';

const SNOOZE_COUNT_KEY = 'SNOOZE_TAX_ACTIVE_SNOOZE_COUNT';

export async function getActiveSnoozeCount() {
  const count = await getItem(SNOOZE_COUNT_KEY);
  return count ? parseInt(count, 10) : 0;
}

export async function incrementActiveSnoozeCount() {
  const count = await getActiveSnoozeCount();
  const newCount = count + 1;
  await setItem(SNOOZE_COUNT_KEY, newCount.toString());
  return newCount;
}

export async function resetActiveSnoozeCount() {
  await deleteItem(SNOOZE_COUNT_KEY);
}
