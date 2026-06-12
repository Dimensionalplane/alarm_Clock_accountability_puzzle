import React, { useState, useEffect } from 'react';
import { StyleSheet, Alert, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { deductSnoozeTax, logSuccess } from '../services/wallet';
import { snoozeAlarm } from '../services/alarm';
import { getSettings } from '../services/settings';
import { setItem, deleteItem } from '../services/storage';
import { resetActiveSnoozeCount } from '../services/session';
import SnoozeTax from '../components/SnoozeTax';

const UNRESOLVED_ALARM_KEY = 'SNOOZE_TAX_UNRESOLVED_ALARM';

export default function AlarmTriggerScreen() {
  const [settings, setSettings] = useState(null);
  const router = useRouter();

  useEffect(() => {
    setItem(UNRESOLVED_ALARM_KEY, 'true');
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings);
  };

  const handleSnooze = async (penaltyAmount) => {
    await deductSnoozeTax(penaltyAmount, 'Snooze Tax');
    await snoozeAlarm({ id: 'snoozed' }, 9);
    await deleteItem(UNRESOLVED_ALARM_KEY);

    if (Platform.OS !== 'web') {
      Alert.alert('Snoozed', `Penalty of $${penaltyAmount.toFixed(2)} applied. Alarm will fire again in 9 minutes.`, [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } else {
      router.replace('/');
    }
  };

  const onPuzzleSuccess = async () => {
    await deleteItem(UNRESOLVED_ALARM_KEY);
    await logSuccess('Cognitive Dismissal Success');
    await resetActiveSnoozeCount();
    if (Platform.OS !== 'web') {
      Alert.alert('Success', "You're awake! Wallet safe.", [
        { text: 'Great!', onPress: () => router.replace('/') }
      ]);
    } else {
      router.replace('/');
    }
  };

  const onPuzzleFailure = async (reason) => {
    const penalty = settings?.penaltyAmount || 1.00;
    await deductSnoozeTax(penalty, `Alarm Failure: ${reason}`);
    await snoozeAlarm({ id: 'failed' }, 5);
    await deleteItem(UNRESOLVED_ALARM_KEY);

    if (Platform.OS !== 'web') {
      Alert.alert('Failed', "You fell back asleep. Penalty applied. Snoozing for 5 mins.", [
        { text: 'Oops', onPress: () => router.replace('/') }
      ]);
    } else {
      router.replace('/');
    }
  };

  if (!settings) return null;

  return (
    <SafeAreaView style={styles.container}>
      <SnoozeTax
        settings={settings}
        onSnooze={handleSnooze}
        onDismissSuccess={onPuzzleSuccess}
        onDismissFailure={onPuzzleFailure}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
