import * as storage from '../storage';
import { getActiveSnoozeCount, incrementActiveSnoozeCount, resetActiveSnoozeCount } from '../session';

jest.mock('../storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  deleteItem: jest.fn(),
}));

describe('Session Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getActiveSnoozeCount returns 0 when no count is stored', async () => {
    storage.getItem.mockResolvedValue(null);
    const count = await getActiveSnoozeCount();
    expect(count).toBe(0);
  });

  test('incrementActiveSnoozeCount increments the stored value', async () => {
    storage.getItem.mockResolvedValueOnce('2');
    const newCount = await incrementActiveSnoozeCount();
    expect(newCount).toBe(3);
    expect(storage.setItem).toHaveBeenCalledWith(expect.any(String), '3');
  });

  test('resetActiveSnoozeCount deletes the stored value', async () => {
    await resetActiveSnoozeCount();
    expect(storage.deleteItem).toHaveBeenCalled();
  });
});
