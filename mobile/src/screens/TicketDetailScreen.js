import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../api/client';
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
const PAYMENT_LABELS = { yet_to_be_paid: 'Yet to be paid', part_payment: 'Part payment', fully_paid: 'Fully paid' };

export default function TicketDetailScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const ticketId = route.params?.ticketId;
  const initialTicket = route.params?.ticket;
  const [ticket, setTicket] = useState(initialTicket || null);
  const [loading, setLoading] = useState(!initialTicket && !!ticketId);

  useEffect(() => {
    if (ticketId && !ticketId.startsWith('local_')) {
      api.get(`/tickets/${ticketId}`)
        .then(({ data }) => setTicket(data))
        .catch(() => setTicket(null))
        .finally(() => setLoading(false));
    } else if (initialTicket) {
      setTicket(initialTicket);
    }
  }, [ticketId]);

  const edit = () => {
    navigation.navigate('TicketForm', { ticketId, ticket });
  };

  if (loading) return <Text style={styles.centered}>Loading…</Text>;
  if (!ticket) return <Text style={styles.centered}>Ticket not found</Text>;

  const client = ticket.clientId;
  const clientName = typeof client === 'object' && client?.name ? client.name : 'Client';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.ticketNum}>{ticket.ticketNumber || `#${(ticket._id || '').slice(-6)}`}</Text>
        <Text style={styles.client}>{clientName}</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text style={styles.value}>{STATUS_LABELS[ticket.status] || ticket.status}</Text>
        </View>
        {ticket.dueDate && (
          <View style={styles.row}>
            <Text style={styles.label}>Due date</Text>
            <Text style={styles.value}>{format(new Date(ticket.dueDate), 'PP')}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Payment</Text>
          <Text style={styles.value}>{PAYMENT_LABELS[ticket.paymentStatus] || ticket.paymentStatus}</Text>
        </View>
        {ticket.totalAmount != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Total</Text>
            <Text style={styles.value}>{ticket.currency || ''} {ticket.totalAmount}</Text>
          </View>
        )}
        {ticket.paymentStatus === 'part_payment' && ticket.amountPaid != null && (
          <View style={styles.row}>
            <Text style={styles.label}>Paid</Text>
            <Text style={styles.value}>{ticket.amountPaid}</Text>
          </View>
        )}
        {ticket.notes ? (
          <View style={styles.row}>
            <Text style={styles.label}>Notes</Text>
            <Text style={styles.value}>{ticket.notes}</Text>
          </View>
        ) : null}
      </View>
      <TouchableOpacity style={styles.button} onPress={edit}>
        <Text style={styles.buttonText}>Edit ticket</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fafafa' },
  content: { padding: 20, paddingBottom: 40 },
  centered: { padding: 24, textAlign: 'center', color: '#737373' },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e5e5', borderRadius: 8, padding: 16 },
  ticketNum: { fontSize: 14, color: '#737373' },
  client: { fontSize: 18, fontWeight: '600', color: '#0a0a0a', marginTop: 4 },
  row: { marginTop: 12 },
  label: { fontSize: 12, color: '#737373' },
  value: { fontSize: 16, color: '#0a0a0a', marginTop: 2 },
  button: { backgroundColor: '#0a0a0a', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  buttonText: { color: '#fafafa', fontWeight: '600' },
});
