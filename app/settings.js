import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, Alert, Switch } from 'react-native';
import { getSettings, saveSettings } from '../services/settings';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    penaltyAmount: 1.00,
    difficulty: 'medium',
    puzzleTimer: 60,
    penaltyConfig: { type: 'flat', increment: 0.50 }
  });
  const [penaltyText, setPenaltyText] = useState('1.00');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    const currentSettings = await getSettings();
    setSettings(currentSettings);
    setPenaltyText(currentSettings.penaltyAmount.toFixed(2));
  };

  const handleSave = async (newSettings) => {
    const updated = await saveSettings(newSettings);
    setSettings(updated);
  };

  const onPenaltyEndEditing = () => {
    const amount = parseFloat(penaltyText) || 0;
    setPenaltyText(amount.toFixed(2));
    handleSave({ ...settings, penaltyAmount: amount });
  };

  const handleDifficultyChange = (difficulty) => {
    let timer = 60;
    if (difficulty === 'easy') timer = 90;
    if (difficulty === 'hard') timer = 45;
    handleSave({ ...settings, difficulty, puzzleTimer: timer });
  };

  const togglePenaltyType = () => {
    const newType = settings.penaltyConfig.type === 'flat' ? 'incremental' : 'flat';
    handleSave({
      ...settings,
      penaltyConfig: { ...settings.penaltyConfig, type: newType }
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Penalty Customization</Text>
        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Base Penalty</Text>
          <View style={styles.inputContainer}>
            <Text style={styles.currency}>$</Text>
            <TextInput
              style={styles.input}
              keyboardType="decimal-pad"
              value={penaltyText}
              onChangeText={setPenaltyText}
              onEndEditing={onPenaltyEndEditing}
            />
          </View>
        </View>

        <View style={[styles.settingItem, { marginTop: 20 }]}>
          <View>
            <Text style={styles.settingLabel}>Incremental Penalty</Text>
            <Text style={styles.settingSubLabel}>Increases with each snooze</Text>
          </View>
          <Switch
            value={settings.penaltyConfig.type === 'incremental'}
            onValueChange={togglePenaltyType}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Puzzle Difficulty</Text>
        <View style={styles.difficultyContainer}>
          {['easy', 'medium', 'hard'].map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.difficultyButton,
                settings.difficulty === level && styles.selectedDifficulty
              ]}
              onPress={() => handleDifficultyChange(level)}
            >
              <Text style={[
                styles.difficultyText,
                settings.difficulty === level && styles.selectedDifficultyText
              ]}>
                {level.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.difficultyHint}>
          {settings.difficulty === 'easy' && '90s timer, clear 1 line.'}
          {settings.difficulty === 'medium' && '60s timer, clear 1 line.'}
          {settings.difficulty === 'hard' && '45s timer, clear 2 lines!'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color="#6c757d" />
        <Text style={styles.infoText}>
          Higher penalties and harder puzzles increase your motivation to wake up!
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#212529',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    fontSize: 16,
    color: '#495057',
  },
  settingSubLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  currency: {
    fontSize: 16,
    color: '#495057',
    marginRight: 2,
  },
  input: {
    fontSize: 16,
    padding: 10,
    width: 80,
    textAlign: 'right',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  difficultyButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007bff',
    alignItems: 'center',
  },
  selectedDifficulty: {
    backgroundColor: '#007bff',
  },
  difficultyText: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  selectedDifficultyText: {
    color: '#fff',
  },
  difficultyHint: {
    marginTop: 15,
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
  },
  infoBox: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#6c757d',
  },
});
