import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BACKEND_URL = 'http://localhost:8080';

export default function SystemDashboard() {
  const [statuses, setStatuses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isReplaying, setIsReplaying] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

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
