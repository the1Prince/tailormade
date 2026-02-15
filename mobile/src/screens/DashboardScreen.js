import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NetInfo from '@react-native-community/netinfo';
import api from '../api/client';
import { syncWhenOnline, loadOfflineFirst } from '../sync/syncService';
import { format, isWithinInterval, addDays } from 'date-fns';

export default function DashboardScreen() {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [dueSoon, setDueSoon] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(null);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    NetInfo.addEventListener((s) => setOffline(!s.isConnected));
  }, []);

  const load = async () => {
    const { tickets: local, lastSync: ls } = await loadOfflineFirst();
    setTickets(local);
    setLastSync(ls);
    const now = new Date();
    const in3 = addDays(now, 3);
    const count = local.filter(
      (t) => t.dueDate && t.status !== 'cancelled' && t.status !== 'collected' && isWithinInterval(new Date(t.dueDate), { start: now, end: in3 })
    ).length;
    setDueSoon(count);
    if (!offline) {
      const res = await syncWhenOnline();
      if (res.ok) load();
    }
  };

  useEffect(() => {
    load();
  }, [offline]);

  const onRefresh = async () => {
    setRefreshing(true);
    await syncWhenOnline();
    await load();
    setRefreshing(false);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {offline && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>You’re offline. Data will sync when connected.</Text>
        </View>
      )}
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Tickets due soon (3 days)</Text>
        <Text style={styles.cardValue}>{dueSoon}</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.cardLabel}>Total tickets</Text>
        <Text style={styles.cardValue}>{tickets.length}</Text>
      </View>
      {lastSync && (
        <Text style={styles.syncText}>Last sync: {format(lastSync, 'PPp')}</Text>
      )}
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Tickets', { screen: 'TicketsList' })}
      >
        <Text style={styles.primaryButtonText}>View all tickets</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => navigation.navigate('Clients', { screen: 'ClientsList' })}
      >
        <Text style={styles.primaryButtonText}>View clients</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 20, paddingBottom: 100 },
  banner: { backgroundColor: '#fef3c7', padding: 12, borderRadius: 8, marginBottom: 16 },
  bannerText: { color: '#92400e', fontSize: 14 },
  card: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardLabel: { fontSize: 14, color: '#737373', marginBottom: 4 },
  cardValue: { fontSize: 24, fontWeight: '600', color: '#0a0a0a' },
  syncText: { fontSize: 12, color: '#737373', marginTop: 8 },
  primaryButton: {
    backgroundColor: '#0a0a0a',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  primaryButtonText: { color: '#fafafa', fontSize: 16, fontWeight: '600' },
});
