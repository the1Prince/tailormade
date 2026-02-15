import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import api from '../api/client';

export default function ProfileScreen() {
  const { user, logout } = useAuth();

  const exportData = () => {
    api.get('/gdpr/export', { responseType: 'blob' }).then((res) => {
      // In a real app, use expo-file-system to save and share the file
      Alert.alert('Export', 'Your data export would be downloaded. In production, use share/save to device.');
    }).catch(() => Alert.alert('Error', 'Export failed'));
  };

  const deleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and data. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            api.delete('/gdpr/delete-account')
              .then(() => logout())
              .catch(() => Alert.alert('Error', 'Deletion failed'));
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.name}>{user?.name || user?.username || 'Tailor'}</Text>
        <Text style={styles.email}>{user?.username || user?.email || '—'}</Text>
      </View>
      <TouchableOpacity style={styles.row} onPress={exportData}>
        <Text style={styles.rowText}>Export my data</Text>
        <Text style={styles.rowSub}>GDPR — download your data</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.row, styles.danger]} onPress={deleteAccount}>
        <Text style={styles.rowText}>Delete my account</Text>
        <Text style={styles.rowSub}>Permanently remove account and data</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fafafa' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 16, marginBottom: 20 },
  name: { fontSize: 18, fontWeight: '600', color: '#0a0a0a' },
  email: { fontSize: 14, color: '#737373', marginTop: 4 },
  row: { backgroundColor: '#fff', padding: 16, borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, marginBottom: 12 },
  rowText: { fontSize: 16, fontWeight: '500', color: '#0a0a0a' },
  rowSub: { fontSize: 13, color: '#737373', marginTop: 4 },
  danger: { borderColor: '#fecaca' },
  logout: { marginTop: 24, paddingVertical: 14, alignItems: 'center' },
  logoutText: { fontSize: 16, color: '#737373', fontWeight: '500' },
});
