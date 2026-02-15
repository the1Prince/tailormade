import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadOfflineFirst } from '../sync/offlineStore';
import { syncWhenOnline } from '../sync/syncService';
import NetInfo from '@react-native-community/netinfo';
import { format } from 'date-fns';

const STATUS_LABELS = {
  draft: 'Draft',
  on_hold: 'On hold',
  in_progress: 'In progress',
  ready_for_fitting: 'Ready for fitting',
  completed: 'Completed',
  collected: 'Collected',
  cancelled: 'Cancelled',
};

export default function TicketsScreen() {
  const navigation = useNavigation();
  const [tickets, setTickets] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    NetInfo.addEventListener((s) => setOffline(!s.isConnected));
  }, []);

  const load = async () => {
    const { tickets: list } = await loadOfflineFirst();
    setTickets(list);
    if (!offline) {
      await syncWhenOnline();
      const { tickets: next } = await loadOfflineFirst();
      setTickets(next);
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
    <View style={styles.container}>
      {offline && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>Offline — data will sync when online</Text>
        </View>
      )}
      <FlatList
        data={tickets}
        keyExtractor={(item) => item._id || item.localId || String(Math.random())}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No tickets yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('TicketDetail', { ticketId: item._id, ticket: item })}
          >
            <Text style={styles.ticketNum}>{item.ticketNumber || `#${(item._id || '').slice(-6)}`}</Text>
            <Text style={styles.client}>{item.clientId?.name || 'Client'}</Text>
            <View style={styles.meta}>
              <Text style={styles.status}>{STATUS_LABELS[item.status] || item.status}</Text>
              {item.dueDate && <Text style={styles.due}>{format(new Date(item.dueDate), 'PP')}</Text>}
            </View>
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('TicketForm', {})}
      >
        <Text style={styles.fabText}>+ New ticket</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  banner: { backgroundColor: '#fef3c7', padding: 10 },
  bannerText: { color: '#92400e', fontSize: 13 },
  row: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  ticketNum: { fontSize: 14, color: '#737373' },
  client: { fontSize: 16, fontWeight: '600', color: '#0a0a0a', marginTop: 4 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  status: { fontSize: 13, color: '#0a0a0a' },
  due: { fontSize: 13, color: '#737373' },
  empty: { padding: 24, textAlign: 'center', color: '#737373' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: '#0a0a0a',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  fabText: { color: '#fafafa', fontWeight: '600' },
});
