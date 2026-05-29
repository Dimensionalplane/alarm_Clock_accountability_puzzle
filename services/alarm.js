import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getItem, setItem } from './storage';

const ALARMS_KEY = 'SNOOZE_TAX_ALARMS';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestPermissions() {
  if (Platform.OS === 'web') return true;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') {
    console.error('Failed to get push token for push notification!');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('alarms', {
      name: 'Alarms',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
      sound: 'default',
    });
  }

  return true;
}

export async function getAlarms() {
  const alarms = await getItem(ALARMS_KEY);
  return alarms ? JSON.parse(alarms) : [];
}

export async function saveAlarms(alarms) {
  await setItem(ALARMS_KEY, JSON.stringify(alarms));
}

export async function scheduleAlarm(alarm) {
  if (Platform.OS === 'web') return ['web-id'];

  const [hours, minutes] = alarm.time.split(':').map(Number);

  // Schedule a notification for each selected day
  const notificationIds = await Promise.all(alarm.days.map(async (day) => {
    // day is 0-6 (Sun-Sat), matching expo-notifications
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Wake Up! ⏰",
        body: "Time to get up or pay the Snooze Tax!",
        data: { alarmId: alarm.id, type: 'alarm' },
        categoryIdentifier: 'alarm',
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        ios: {
          sound: true,
          critical: true,
          volume: 1.0,
        },
      },
      trigger: {
        hour: hours,
        minute: minutes,
        weekday: day + 1, // expo-notifications weekday is 1-7
        repeats: true,
      },
    });
  }));

  return notificationIds; // Now returns an array
}

export async function cancelAlarm(notificationIds) {
  if (!notificationIds) return;

  const ids = Array.isArray(notificationIds) ? notificationIds : [notificationIds];

  for (const id of ids) {
    if (id && Platform.OS !== 'web') {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
  }
}

export async function snoozeAlarm(alarm, minutes = 9) {
  if (Platform.OS === 'web') return 'web-snooze-id';

  const trigger = new Date();
  trigger.setMinutes(trigger.getMinutes() + minutes);

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Snooze Alert! ⏰",
      body: "You paid for this extra sleep. Wake up now!",
      data: { alarmId: alarm.id, type: 'alarm' },
      categoryIdentifier: 'alarm',
      sound: true,
      ios: {
        sound: true,
        critical: true,
        volume: 1.0,
      },
    },
    trigger,
  });

  return id;
}
