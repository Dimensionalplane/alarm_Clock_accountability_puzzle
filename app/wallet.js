import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getBalance, getHistory, topUp } from '../services/wallet';
import { Ionicons } from '@expo/vector-icons';

const TOP_UP_AMOUNTS = [5, 10, 25, 50];

export default function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    const currentBalance = await getBalance();
    const currentHistory = await getHistory();
    setBalance(currentBalance);
    setHistory(currentHistory);
  };

  const handleTopUp = async (amount) => {
    const newBalance = await topUp(amount);
    setBalance(newBalance);
    const updatedHistory = await getHistory();
    setHistory(updatedHistory);
    Alert.alert('Success', `Added $${amount.toFixed(2)} to your wallet.`);
  };

  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <View>
        <Text style={styles.historyDesc}>{item.description}</Text>
        <Text style={styles.historyTime}>{new Date(item.timestamp).toLocaleString()}</Text>
      </View>
      <Text style={[styles.historyAmount, item.type === 'tax' ? styles.taxText : styles.topupText]}>
        {item.type === 'tax' ? '-' : '+'}${item.amount.toFixed(2)}
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceValue}>${balance.toFixed(2)}</Text>

        <View style={styles.topUpRow}>
          {TOP_UP_AMOUNTS.map((amount) => (
            <TouchableOpacity
              key={amount}
              style={styles.topUpOption}
              onPress={() => handleTopUp(amount)}
            >
              <Text style={styles.topUpOptionText}>+${amount}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <Text style={styles.historyTitle}>Transaction History</Text>
      <FlatList
        data={history}
        keyExtractor={(item) => item.id}
        renderItem={renderHistoryItem}
        contentContainerStyle={styles.historyList}
        ListEmptyComponent={<Text style={styles.emptyText}>No transactions yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 20,
  },
  balanceCard: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 25,
    alignItems: 'center',
    marginBottom: 30,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6c757d',
    marginBottom: 5,
  },
  balanceValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 20,
  },
  topUpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  topUpOption: {
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    minWidth: '22%',
    alignItems: 'center',
  },
  topUpOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 15,
  },
  historyList: {
    paddingBottom: 20,
  },
  historyItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  historyDesc: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  historyTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  taxText: {
    color: '#dc3545',
  },
  topupText: {
    color: '#28a745',
  },
  emptyText: {
    textAlign: 'center',
    color: '#6c757d',
    marginTop: 30,
    fontSize: 16,
  },
});
