import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { getItem, deleteItem } from '../services/storage';
import { deductSnoozeTax } from '../services/wallet';
import { Alert, Platform } from 'react-native';

const UNRESOLVED_ALARM_KEY = 'SNOOZE_TAX_UNRESOLVED_ALARM';

export default function RootLayout() {
  useEffect(() => {
    checkUnresolvedAlarms();
  }, []);

  const checkUnresolvedAlarms = async () => {
    const unresolved = await getItem(UNRESOLVED_ALARM_KEY);
    if (unresolved === 'true') {
      await deductSnoozeTax(null, 'Unresolved Alarm Avoidance');
      await deleteItem(UNRESOLVED_ALARM_KEY);
      if (Platform.OS !== 'web') {
        Alert.alert(
          'Penalty Applied',
          'We detected an unresolved alarm or app force-quit. Penalty has been deducted from your wallet.',
          [{ text: 'I understand' }]
        );
      } else {
        console.log('Penalty applied for unresolved alarm avoidance');
      }
    }
  };

  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Alarms' }} />
      <Stack.Screen name="wallet" options={{ title: 'Wallet' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="dashboard" options={{ title: 'System Dashboard' }} />
      <Stack.Screen name="trigger" options={{ headerShown: false, presentation: 'fullScreenModal' }} />
    </Stack>
  );
}
