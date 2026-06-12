import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getBalance, getHistory } from '../services/wallet';

const BACKEND_URL = 'http://localhost:8080';

export default function SystemDashboard() {
  const [statuses, setStatuses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isReplaying, setIsReplaying] = useState(false);
  const [userMetrics, setUserMetrics] = useState({
    balance: 0,
    totalTax: 0,
    successCount: 0,
    failCount: 0
  });

  useEffect(() => {
    fetchStatus();
    loadUserMetrics();
  }, []);

  const loadUserMetrics = async () => {
    const balance = await getBalance();
    const history = await getHistory();

    let totalTax = 0;
    let successCount = 0;
    let failCount = 0;

    history.forEach(entry => {
      if (entry.type === 'tax') {
        totalTax += entry.amount;
        if (entry.description.includes('Failure') || entry.description.includes('Avoidance')) {
          failCount++;
        }
      } else if (entry.type === 'success') {
          successCount++;
      }
    });

    setUserMetrics({
      balance,
      totalTax,
      successCount,
      failCount
    });
  };

  const fetchStatus = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/system/status`);
      const data = await response.json();
      setStatuses(data);
    } catch (error) {
      console.error('Failed to fetch status:', error);
    }
  };

  const startReplay = () => {
    setIsReplaying(true);
    setLogs([]);
    const ws = new WebSocket('ws://localhost:8080/api/replay');

    ws.onmessage = (e) => {
      setLogs((prev) => [...prev, e.data]);
    };

    ws.onclose = () => {
      setIsReplaying(false);
    };

    ws.onerror = (e) => {
      console.error('WebSocket error:', e.message);
      setIsReplaying(false);
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User Accountability</Text>
        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Balance</Text>
            <Text style={styles.metricValue}>${userMetrics.balance.toFixed(2)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Snooze Tax</Text>
            <Text style={[styles.metricValue, { color: '#dc3545' }]}>${userMetrics.totalTax.toFixed(2)}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Wake-ups</Text>
            <Text style={[styles.metricValue, { color: '#28a745' }]}>{userMetrics.successCount}</Text>
          </View>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Failures</Text>
            <Text style={styles.metricValue}>{userMetrics.failCount}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Git Submodule Status</Text>
        {statuses.length > 0 ? (
          statuses.map((s, i) => (
            <View key={i} style={styles.statusItem}>
              <Text style={styles.statusName}>{s.name}</Text>
              <Text style={[
                styles.statusValue,
                s.status === 'synced' ? styles.synced : styles.dirty
              ]}>
                {s.status.toUpperCase()}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No submodules detected.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Session Replay</Text>
        <TouchableOpacity
          style={[styles.button, isReplaying && styles.buttonDisabled]}
          onPress={startReplay}
          disabled={isReplaying}
        >
          <Text style={styles.buttonText}>
            {isReplaying ? 'Replaying...' : 'Start Session Replay'}
          </Text>
        </TouchableOpacity>

        <View style={styles.logContainer}>
          {logs.map((log, i) => (
            <Text key={i} style={styles.logText}> {'>'} {log}</Text>
          ))}
        </View>
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
    marginBottom: 15,
    color: '#212529',
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 15,
  },
  metricItem: {
    width: '45%',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 5,
    textAlign: 'center',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
  },
  statusItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  statusName: {
    fontSize: 16,
    color: '#495057',
  },
  statusValue: {
    fontWeight: 'bold',
  },
  synced: { color: '#28a745' },
  dirty: { color: '#dc3545' },
  button: {
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  logContainer: {
    backgroundColor: '#212529',
    borderRadius: 10,
    padding: 15,
    minHeight: 150,
  },
  logText: {
    color: '#28a745',
    fontFamily: 'monospace',
    fontSize: 12,
    marginBottom: 5,
  },
  emptyText: {
    color: '#6c757d',
    fontStyle: 'italic',
  },
});
