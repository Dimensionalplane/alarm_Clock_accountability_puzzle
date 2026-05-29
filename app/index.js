import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Modal, TextInput, Button, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { getAlarms, saveAlarms, scheduleAlarm, cancelAlarm, requestPermissions } from '../services/alarm';
import { getBalance } from '../services/wallet';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function AlarmListScreen() {
  const [alarms, setAlarms] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newTime, setNewTime] = useState('07:00');
  const [selectedDays, setSelectedDays] = useState([1, 2, 3, 4, 5]); // Default Mon-Fri
  const [balance, setBalance] = useState(0);
  const router = useRouter();

  useEffect(() => {
    requestPermissions();
    loadAlarms();
    checkBalance();

    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const { type } = response.notification.request.content.data;
      if (type === 'alarm') {
        router.push('/trigger');
      }
    });

    return () => subscription.remove();
  }, []);

  const loadAlarms = async () => {
    const savedAlarms = await getAlarms();
    setAlarms(savedAlarms);
  };

  const checkBalance = async () => {
    const currentBalance = await getBalance();
    setBalance(currentBalance);
  };

  const validateTime = (timeStr) => {
    const parts = timeStr.split(':');
    if (parts.length !== 2) return false;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    return !isNaN(h) && !isNaN(m) && h >= 0 && h < 24 && m >= 0 && m < 60;
  };

  const handleAddAlarm = async () => {
    if (balance <= 0) {
      Alert.alert('Low Balance', 'You must have at least some money in your wallet to set an alarm.');
      return;
    }

    if (!validateTime(newTime)) {
      Alert.alert('Invalid Time', 'Please enter time in HH:MM format (e.g., 07:00).');
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert('Select Days', 'Please select at least one day for the alarm.');
      return;
    }

    const newAlarm = {
      id: Date.now().toString(),
      time: newTime,
      days: selectedDays,
      enabled: true,
      notificationId: null,
    };

    const notificationId = await scheduleAlarm(newAlarm);
    newAlarm.notificationId = notificationId;

    const updatedAlarms = [...alarms, newAlarm];
    setAlarms(updatedAlarms);
    await saveAlarms(updatedAlarms);
    setModalVisible(false);
  };

  const toggleAlarm = async (id) => {
    const updatedAlarms = await Promise.all(alarms.map(async (a) => {
      if (a.id === id) {
        if (a.enabled) {
          await cancelAlarm(a.notificationId);
          return { ...a, enabled: false, notificationId: null };
        } else {
          if (balance <= 0) {
            Alert.alert('Low Balance', 'You need a positive balance to enable an alarm.');
            return a;
          }
          const notificationId = await scheduleAlarm(a);
          return { ...a, enabled: true, notificationId };
        }
      }
      return a;
    }));
    setAlarms(updatedAlarms);
    await saveAlarms(updatedAlarms);
  };

  const deleteAlarm = async (id) => {
    const alarmToDelete = alarms.find(a => a.id === id);
    if (alarmToDelete.notificationId) {
      await cancelAlarm(alarmToDelete.notificationId);
    }
    const updatedAlarms = alarms.filter(a => a.id !== id);
    setAlarms(updatedAlarms);
    await saveAlarms(updatedAlarms);
  };

  const renderAlarmItem = ({ item }) => (
    <View style={styles.alarmItem}>
      <View>
        <Text style={styles.alarmTime}>{item.time}</Text>
        <View style={styles.daysList}>
          {DAYS_OF_WEEK.map((day, i) => (
            <Text
              key={i}
              style={[
                styles.dayLabel,
                item.days.includes(i) && styles.activeDayLabel
              ]}
            >
              {day}
            </Text>
          ))}
        </View>
      </View>
      <View style={styles.alarmActions}>
        <Switch
          value={item.enabled}
          onValueChange={() => toggleAlarm(item.id)}
        />
        <TouchableOpacity onPress={() => deleteAlarm(item.id)} style={styles.deleteButton}>
          <Ionicons name="trash-outline" size={24} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.balanceLabel}>Wallet Balance</Text>
          <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity onPress={() => router.push('/dashboard')} style={styles.headerButton}>
            <Ionicons name="stats-chart-outline" size={24} color="#6c757d" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/settings')} style={styles.headerButton}>
            <Ionicons name="settings-outline" size={24} color="#6c757d" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/wallet')} style={styles.headerButton}>
            <Ionicons name="wallet-outline" size={24} color="#007bff" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={alarms}
        keyExtractor={(item) => item.id}
        renderItem={renderAlarmItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>No alarms set.</Text>}
      />

      <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Alarm</Text>
            <TextInput
              style={styles.input}
              placeholder="07:00"
              value={newTime}
              onChangeText={setNewTime}
            />

            <View style={styles.daySelector}>
              {DAYS_OF_WEEK.map((day, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.dayButton,
                    selectedDays.includes(i) && styles.selectedDayButton
                  ]}
                  onPress={() => toggleDay(i)}
                >
                  <Text style={[
                    styles.dayButtonText,
                    selectedDays.includes(i) && styles.selectedDayButtonText
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} color="#6c757d" />
              <Button title="Save" onPress={handleAddAlarm} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    elevation: 2,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  balanceLabel: {
    fontSize: 12,
    color: '#6c757d',
  },
  balanceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  headerButton: {
    padding: 10,
    marginLeft: 5,
  },
  list: {
    padding: 20,
  },
  alarmItem: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    elevation: 1,
  },
  alarmTime: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#212529',
  },
  daysList: {
    flexDirection: 'row',
    marginTop: 5,
  },
  dayLabel: {
    fontSize: 12,
    color: '#ced4da',
    marginRight: 5,
  },
  activeDayLabel: {
    color: '#007bff',
    fontWeight: 'bold',
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deleteButton: {
    marginLeft: 15,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    backgroundColor: '#007bff',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    color: '#6c757d',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 30,
    borderRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 10,
    padding: 15,
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  dayButton: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    borderWidth: 1,
    borderColor: '#ced4da',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedDayButton: {
    backgroundColor: '#007bff',
    borderColor: '#007bff',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#495057',
  },
  selectedDayButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
});
