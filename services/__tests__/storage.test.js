import * as SecureStore from 'expo-secure-store';
import { getItem, setItem, deleteItem } from '../storage';
import { Platform } from 'react-native';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

describe('Storage Service', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    Platform.OS = originalPlatform;
  });

  test('getItem calls SecureStore on native', async () => {
    Platform.OS = 'ios';
    SecureStore.getItemAsync.mockResolvedValue('mock-value');

    const value = await getItem('test-key');

    expect(value).toBe('mock-value');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('test-key');
  });

  test('setItem calls SecureStore on native', async () => {
    Platform.OS = 'android';
    await setItem('test-key', 'test-value');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('test-key', 'test-value');
  });

  test('deleteItem calls SecureStore on native', async () => {
    Platform.OS = 'ios';
    await deleteItem('test-key');
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('test-key');
  });
});
