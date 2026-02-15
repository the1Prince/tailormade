import * as Notifications from 'expo-notifications';
import { addDays, subHours } from 'date-fns';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowAlert: true, shouldPlaySound: true }),
});

export async function scheduleDueReminders(tickets) {
  await Notifications.cancelAllScheduledNotificationsAsync();
  const now = new Date();
  for (const ticket of tickets) {
    if (!ticket.dueDate || ['cancelled', 'collected'].includes(ticket.status)) continue;
    const due = new Date(ticket.dueDate);
    if (due <= now) continue;
    const clientName = ticket.clientId?.name || 'Client';
    const title = 'TailorMade: Collection due';
    const body = `${ticket.ticketNumber || 'Ticket'} for ${clientName}`;
    const in3Days = subHours(addDays(due, 0), 3 * 24);
    const in24h = subHours(due, 24);
    if (in3Days > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body: `${body} — in 3 days` },
        trigger: { date: in3Days, channelId: 'due-dates' },
      });
    }
    if (in24h > now) {
      await Notifications.scheduleNotificationAsync({
        content: { title, body: `${body} — tomorrow` },
        trigger: { date: in24h, channelId: 'due-dates' },
      });
    }
  }
}

export async function requestPermissions() {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}
