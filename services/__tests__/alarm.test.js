import * as Notifications from 'expo-notifications';
import { scheduleAlarm, cancelAlarm, snoozeAlarm } from '../alarm';
import * as storage from '../storage';

jest.mock('expo-notifications', () => ({
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
  AndroidNotificationPriority: {
    HIGH: 'high',
  },
}));

jest.mock('../storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
}));

describe('Alarm Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('scheduleAlarm schedules a notification for each selected day', async () => {
    const alarm = {
      id: '123',
      time: '08:30',
      days: [1, 3, 5], // Mon, Wed, Fri
    };

    Notifications.scheduleNotificationAsync.mockResolvedValue('mock-notification-id');

    const ids = await scheduleAlarm(alarm);

    expect(ids).toHaveLength(3);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);

    // Check first call parameters
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        ios: expect.objectContaining({ critical: true }),
      }),
      trigger: expect.objectContaining({
        hour: 8,
        minute: 30,
        weekday: 2, // Mon (1+1)
      }),
    }));
  });

  test('cancelAlarm cancels all provided notification IDs', async () => {
    const ids = ['id-1', 'id-2'];
    await cancelAlarm(ids);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('id-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('id-2');
  });

  test('snoozeAlarm schedules a notification 9 minutes in the future', async () => {
    const alarm = { id: '123' };
    Notifications.scheduleNotificationAsync.mockResolvedValue('snooze-id');

    const id = await snoozeAlarm(alarm, 9);

    expect(id).toBe('snooze-id');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.objectContaining({
        title: 'Snooze Alert! ⏰',
      }),
    }));
  });
});
