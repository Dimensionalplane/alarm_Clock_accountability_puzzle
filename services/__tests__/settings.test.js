import * as storage from '../storage';
import { getSettings, saveSettings } from '../settings';

jest.mock('../storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Settings Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getSettings returns default settings when nothing is stored', async () => {
    storage.getItem.mockResolvedValue(null);
    const settings = await getSettings();
    expect(settings.penaltyAmount).toBe(1.00);
    expect(settings.difficulty).toBe('medium');
  });

  test('saveSettings merges new values and persists them', async () => {
    storage.getItem.mockResolvedValue(JSON.stringify({ penaltyAmount: 1.00, difficulty: 'medium' }));

    await saveSettings({ difficulty: 'hard', puzzleTimer: 45 });

    expect(storage.setItem).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"difficulty":"hard"')
    );
  });
});
