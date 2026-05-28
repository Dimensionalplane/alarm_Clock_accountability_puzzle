import * as storage from '../storage';
import { getBalance, topUp, deductSnoozeTax } from '../wallet';

jest.mock('../storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  deleteItem: jest.fn(),
}));

jest.mock('../settings', () => ({
  getSettings: jest.fn().mockResolvedValue({ penaltyAmount: 1.00 }),
}));

describe('Wallet Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getBalance returns 0 when no balance is stored', async () => {
    storage.getItem.mockResolvedValue(null);
    const balance = await getBalance();
    expect(balance).toBe(0);
  });

  test('topUp adds amount to balance', async () => {
    storage.getItem.mockResolvedValueOnce('5.00');
    storage.getItem.mockResolvedValueOnce('[]');

    const newBalance = await topUp(10);

    expect(newBalance).toBe(15);
    expect(storage.setItem).toHaveBeenCalledWith(expect.any(String), '15');
  });

  test('deductSnoozeTax subtracts amount from balance', async () => {
    storage.getItem.mockResolvedValueOnce('5.00');
    storage.getItem.mockResolvedValueOnce('[]');

    const newBalance = await deductSnoozeTax();

    expect(newBalance).toBe(4);
    expect(storage.setItem).toHaveBeenCalledWith(expect.any(String), '4');
  });
});
