import { getItem, setItem, deleteItem } from './storage';
import { getSettings } from './settings';

const WALLET_BALANCE_KEY = 'SNOOZE_TAX_WALLET_BALANCE';
const TRANSACTION_HISTORY_KEY = 'SNOOZE_TAX_TRANSACTION_HISTORY';

export async function getBalance() {
  const balance = await getItem(WALLET_BALANCE_KEY);
  return balance ? parseFloat(balance) : 0;
}

export async function setBalance(amount) {
  await setItem(WALLET_BALANCE_KEY, amount.toString());
}

export async function getHistory() {
  const history = await getItem(TRANSACTION_HISTORY_KEY);
  return history ? JSON.parse(history) : [];
}

export async function addHistoryEntry(type, amount, description) {
  const history = await getHistory();
  const entry = {
    id: Date.now().toString(),
    type,
    amount,
    description,
    timestamp: new Date().toISOString(),
  };
  history.unshift(entry);
  await setItem(TRANSACTION_HISTORY_KEY, JSON.stringify(history));
}

export async function topUp(amount) {
  const currentBalance = await getBalance();
  const newBalance = currentBalance + amount;
  await setBalance(newBalance);
  await addHistoryEntry('top-up', amount, 'Wallet top-up');
  return newBalance;
}

export async function deductSnoozeTax(amount = null, reason = 'Snooze Tax') {
  const settings = await getSettings();
  const taxAmount = amount !== null ? amount : settings.penaltyAmount;

  const currentBalance = await getBalance();
  const newBalance = Math.max(0, currentBalance - taxAmount);
  await setBalance(newBalance);
  await addHistoryEntry('tax', taxAmount, reason);
  return newBalance;
}

export async function logSuccess(reason = 'Successful Dismissal') {
  await addHistoryEntry('success', 0, reason);
}
