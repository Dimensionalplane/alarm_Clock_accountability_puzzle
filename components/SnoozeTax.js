import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, Platform } from 'react-native';
import WoodBlockPuzzle from './WoodBlockPuzzle';
import { getActiveSnoozeCount, incrementActiveSnoozeCount } from '../services/session';

export default function SnoozeTax({ settings, onSnooze, onDismissSuccess, onDismissFailure }) {
  const [showPuzzle, setShowPuzzle] = useState(false);
  const [snoozeCount, setSnoozeCount] = useState(0);

  useEffect(() => {
    loadSnoozeCount();
  }, []);

  const loadSnoozeCount = async () => {
    const count = await getActiveSnoozeCount();
    setSnoozeCount(count);
  };

  const calculatePenalty = () => {
    const base = settings?.penaltyAmount || 1.00;
    const config = settings?.penaltyConfig || { type: 'flat' };

    if (config.type === 'incremental') {
      const increment = config.increment || 0.50;
      return base + (snoozeCount * increment);
    }
    return base;
  };

  const handleSnoozePress = async () => {
    const penalty = calculatePenalty();
    const newCount = await incrementActiveSnoozeCount();
    setSnoozeCount(newCount);
    onSnooze(penalty);
  };

  const handleDismissPress = () => {
    setShowPuzzle(true);
  };

  const handleDismissFailure = (reason) => {
    const penalty = calculatePenalty();
    onDismissFailure(reason, penalty);
  };

  const currentPenalty = calculatePenalty();

  if (showPuzzle) {
    return (
      <WoodBlockPuzzle
        onSuccess={onDismissSuccess}
        onFailure={handleDismissFailure}
        settings={settings}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WAKE UP!</Text>
      <Text style={styles.subtitle}>Current Penalty: ${currentPenalty.toFixed(2)}</Text>
      {snoozeCount > 0 && (
        <Text style={styles.stats}>Snoozed {snoozeCount} time(s) during this alarm</Text>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.snoozeButton} onPress={handleSnoozePress}>
          <Text style={styles.snoozeText}>Snooze (-${currentPenalty.toFixed(2)})</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.dismissButton} onPress={handleDismissPress}>
          <Text style={styles.dismissText}>Dismiss (Puzzle)</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 20,
    color: '#495057',
    marginBottom: 10,
  },
  stats: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 40,
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
