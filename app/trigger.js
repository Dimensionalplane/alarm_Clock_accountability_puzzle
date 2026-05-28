import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, SafeAreaView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { deductSnoozeTax } from '../services/wallet';
import { snoozeAlarm } from '../services/alarm';
import { getSettings } from '../services/settings';
import { setItem, deleteItem } from '../services/storage';
import WoodBlockPuzzle from '../components/WoodBlockPuzzle';

const UNRESOLVED_ALARM_KEY = 'SNOOZE_TAX_UNRESOLVED_ALARM';

export default function AlarmTriggerScreen() {
  const [showPuzzle, setShowPuzzle] = useState(false);
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

  const handleSnooze = async () => {
    await deductSnoozeTax(null, 'Snooze Tax');
    await snoozeAlarm({ id: 'snoozed' }, 9);
    await deleteItem(UNRESOLVED_ALARM_KEY);
    if (Platform.OS !== 'web') {
      Alert.alert('Snoozed', `Penalty applied. Alarm will fire again in 9 minutes.`, [
        { text: 'OK', onPress: () => router.replace('/') }
      ]);
    } else {
      router.replace('/');
    }
  };

  const handleDismiss = () => {
    setShowPuzzle(true);
  };

  const onPuzzleSuccess = async () => {
    await deleteItem(UNRESOLVED_ALARM_KEY);
    if (Platform.OS !== 'web') {
      Alert.alert('Success', "You're awake! Wallet safe.", [
        { text: 'Great!', onPress: () => router.replace('/') }
      ]);
    } else {
      router.replace('/');
    }
  };

  const onPuzzleFailure = async (reason) => {
    await deductSnoozeTax(null, `Alarm Failure: ${reason}`);
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

  return (
    <SafeAreaView style={styles.container}>
      {!showPuzzle ? (
        <View style={styles.mainContent}>
          <Text style={styles.title}>WAKE UP!</Text>
          <Text style={styles.subtitle}>Don't let the Snooze Tax get you.</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.snoozeButton} onPress={handleSnooze}>
              <Text style={styles.snoozeText}>Snooze (${settings?.penaltyAmount.toFixed(2)})</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.dismissButton} onPress={handleDismiss}>
              <Text style={styles.dismissText}>Dismiss (Puzzle)</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <WoodBlockPuzzle
          onSuccess={onPuzzleSuccess}
          onFailure={onPuzzleFailure}
          settings={settings}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 50,
  },
  buttonContainer: {
    width: '100%',
    gap: 20,
  },
  snoozeButton: {
    backgroundColor: '#ffc107',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  snoozeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
  },
  dismissButton: {
    backgroundColor: '#28a745',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  dismissText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
});
