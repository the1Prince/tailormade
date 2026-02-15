import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { loadOfflineFirst, addPendingCreate } from '../sync/offlineStore';
import { syncWhenOnline } from '../sync/syncService';
import api from '../api/client';
import NetInfo from '@react-native-community/netinfo';

export default function ClientsScreen() {
  const navigation = useNavigation();
  const [clients, setClients] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    NetInfo.addEventListener((s) => setOffline(!s.isConnected));
  }, []);

  const load = async () => {
    const { clients: list } = await loadOfflineFirst();
    setClients(list);
    if (!offline) {
      await syncWhenOnline();
      const { clients: next } = await loadOfflineFirst();
      setClients(next);
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
          <Text style={styles.bannerText}>Offline — changes will sync when online</Text>
        </View>
      )}
      <FlatList
        data={clients}
        keyExtractor={(item) => item._id || item.localId || String(Math.random())}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No clients yet</Text>}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ClientForm', { clientId: item._id, client: item })}
          >
            <Text style={styles.name}>{item.name}</Text>
            {item.phone ? <Text style={styles.meta}>{item.phone}</Text> : null}
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('ClientForm', {})}
      >
        <Text style={styles.fabText}>+ New client</Text>
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
  name: { fontSize: 16, fontWeight: '600', color: '#0a0a0a' },
  meta: { fontSize: 14, color: '#737373', marginTop: 4 },
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
