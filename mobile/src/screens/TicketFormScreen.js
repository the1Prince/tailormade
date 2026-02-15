import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';
import { loadOfflineFirst } from '../sync/offlineStore';
import { addPendingCreate, addPendingUpdate, getTickets, setTickets } from '../sync/offlineStore';
import NetInfo from '@react-native-community/netinfo';
import { format } from 'date-fns';

const STATUS_OPTIONS = ['draft', 'on_hold', 'in_progress', 'ready_for_fitting', 'completed', 'collected', 'cancelled'];
const PAYMENT_OPTIONS = ['yet_to_be_paid', 'part_payment', 'fully_paid'];

export default function TicketFormScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const ticketId = route.params?.ticketId;
  const existing = route.params?.ticket || {};
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState(existing.clientId?._id || existing.clientId || '');
  const [ticketNumber, setTicketNumber] = useState(existing.ticketNumber || '');
  const [status, setStatus] = useState(existing.status || 'draft');
  const [dueDate, setDueDate] = useState(existing.dueDate ? format(new Date(existing.dueDate), 'yyyy-MM-dd') : '');
  const [totalAmount, setTotalAmount] = useState(existing.totalAmount != null ? String(existing.totalAmount) : '');
  const [paymentStatus, setPaymentStatus] = useState(existing.paymentStatus || 'yet_to_be_paid');
  const [amountPaid, setAmountPaid] = useState(existing.amountPaid != null ? String(existing.amountPaid) : '');
  const [notes, setNotes] = useState(existing.notes || '');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadOfflineFirst().then(({ clients: list }) => setClients(list));
  }, []);

  const save = async () => {
    if (!clientId) {
      Alert.alert('Error', 'Select a client');
      return;
    }
    setSaving(true);
    const payload = {
      clientId,
      ticketNumber: ticketNumber.trim() || undefined,
      status,
      dueDate: dueDate || undefined,
      totalAmount: totalAmount ? parseFloat(totalAmount) : 0,
      paymentStatus,
      amountPaid: amountPaid ? parseFloat(amountPaid) : 0,
      notes: notes.trim() || undefined,
    };
    const net = await NetInfo.fetch();
    try {
      if (ticketId && !ticketId.startsWith('local_')) {
        if (net.isConnected) {
          await api.patch(`/tickets/${ticketId}`, payload);
        } else {
          const list = await getTickets();
          const updated = list.map((t) => (t._id === ticketId ? { ...t, ...payload } : t));
          await setTickets(updated);
        }
        navigation.goBack();
        return;
      }
      if (net.isConnected) {
        const { data } = await api.post('/tickets', payload);
        const { tickets: list } = await loadOfflineFirst();
        await setTickets([...list, data]);
      } else {
        const localId = `local_${Date.now()}`;
        await addPendingCreate('ticket', { ...payload, localId });
        const list = await getTickets();
        const client = clients.find((c) => c._id === clientId || c.localId === clientId);
        await setTickets([...list, { ...payload, _id: localId, localId, clientId: client ? { name: client.name } : {} }]);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || e.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Client *</Text>
      <View style={styles.picker}>
        {clients.map((c) => (
          <TouchableOpacity
            key={c._id || c.localId}
            style={[styles.chip, clientId === (c._id || c.localId) && styles.chipActive]}
            onPress={() => setClientId(c._id || c.localId)}
          >
            <Text style={[styles.chipText, clientId === (c._id || c.localId) && styles.chipTextActive]}>{c.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Ticket number</Text>
      <TextInput style={styles.input} value={ticketNumber} onChangeText={setTicketNumber} placeholder="Optional" />
      <Text style={styles.label}>Status</Text>
      <View style={styles.picker}>
        {STATUS_OPTIONS.map((s) => (
          <TouchableOpacity key={s} style={[styles.chip, status === s && styles.chipActive]} onPress={() => setStatus(s)}>
            <Text style={[styles.chipText, status === s && styles.chipTextActive]}>{s.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.label}>Due date</Text>
      <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" />
      <Text style={styles.label}>Total amount</Text>
      <TextInput style={styles.input} value={totalAmount} onChangeText={setTotalAmount} keyboardType="decimal-pad" placeholder="0" />
      <Text style={styles.label}>Payment status</Text>
      <View style={styles.picker}>
        {PAYMENT_OPTIONS.map((p) => (
          <TouchableOpacity key={p} style={[styles.chip, paymentStatus === p && styles.chipActive]} onPress={() => setPaymentStatus(p)}>
            <Text style={[styles.chipText, paymentStatus === p && styles.chipTextActive]}>{p.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {paymentStatus === 'part_payment' && (
        <>
          <Text style={styles.label}>Amount paid</Text>
          <TextInput style={styles.input} value={amountPaid} onChangeText={setAmountPaid} keyboardType="decimal-pad" placeholder="0" />
        </>
      )}
      <Text style={styles.label}>Notes</Text>
      <TextInput style={[styles.input, styles.area]} value={notes} onChangeText={setNotes} placeholder="Notes" multiline />
      <TouchableOpacity style={styles.button} onPress={save} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving…' : 'Save'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#737373', marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  area: { minHeight: 80, textAlignVertical: 'top' },
  picker: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#fff' },
  chipActive: { backgroundColor: '#0a0a0a', borderColor: '#0a0a0a' },
  chipText: { fontSize: 14, color: '#0a0a0a' },
  chipTextActive: { color: '#fafafa' },
  button: { backgroundColor: '#0a0a0a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonText: { color: '#fafafa', fontWeight: '600' },
});
