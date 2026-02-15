import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { addPendingCreate, addPendingUpdate, getClients, setClients } from '../sync/offlineStore';
import NetInfo from '@react-native-community/netinfo';

export default function ClientFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const clientId = route.params?.clientId;
  const existing = route.params?.client || {};
  const [name, setName] = useState(existing.name || '');
  const [phone, setPhone] = useState(existing.phone || '');
  const [email, setEmail] = useState(existing.email || '');
  const [address, setAddress] = useState(existing.address || '');
  const [notes, setNotes] = useState(existing.notes || '');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }
    setSaving(true);
    const payload = { name: name.trim(), phone: phone.trim() || undefined, email: email.trim() || undefined, address: address.trim() || undefined, notes: notes.trim() || undefined };
    const net = await NetInfo.fetch();
    try {
      if (clientId) {
        if (net.isConnected) {
          await api.patch(`/clients/${clientId}`, payload);
        } else {
          await addPendingUpdate('client', clientId, payload);
          const list = await getClients();
          const updated = list.map((c) => (c._id === clientId ? { ...c, ...payload } : c));
          await setClients(updated);
        }
      } else {
        if (net.isConnected) {
          const { data } = await api.post('/clients', payload);
          const list = await getClients();
          await setClients([...list, data]);
        } else {
          const localId = `local_${Date.now()}`;
          await addPendingCreate('client', { ...payload, localId });
          const list = await getClients();
          await setClients([...list, { ...payload, _id: localId, localId }]);
        }
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput style={styles.input} placeholder="Name *" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Phone" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={[styles.input, styles.area]} placeholder="Address" value={address} onChangeText={setAddress} multiline />
      <TextInput style={[styles.input, styles.area]} placeholder="Notes" value={notes} onChangeText={setNotes} multiline />
      <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fafafa' },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  area: { minHeight: 80, textAlignVertical: 'top' },
  button: { backgroundColor: '#0a0a0a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fafafa', fontWeight: '600' },
});
