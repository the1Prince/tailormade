import api from '../api/client';
import * as offline from './offlineStore';

export async function syncWhenOnline() {
  try {
    const [clientsRes, ticketsRes, templatesRes] = await Promise.all([
      api.get('/clients'),
      api.get('/tickets'),
      api.get('/measurement-templates'),
    ]);
    await offline.setClients(clientsRes.data);
    await offline.setTickets(ticketsRes.data);
    await offline.setTemplates(templatesRes.data);
    await offline.setLastSync(new Date());

    const pending = await offline.getPending();
    for (const { resource, payload } of pending.creates) {
      if (resource === 'client') await api.post('/clients', payload);
      if (resource === 'ticket') await api.post('/tickets', payload);
      if (resource === 'template') await api.post('/measurement-templates', payload);
    }
    for (const { resource, id, payload } of pending.updates) {
      if (resource === 'client') await api.patch(`/clients/${id}`, payload);
      if (resource === 'ticket') await api.patch(`/tickets/${id}`, payload);
      if (resource === 'template') await api.patch(`/measurement-templates/${id}`, payload);
    }
    for (const { resource, id } of pending.deletes) {
      if (resource === 'client') await api.delete(`/clients/${id}`);
      if (resource === 'ticket') await api.delete(`/tickets/${id}`);
      if (resource === 'template') await api.delete(`/measurement-templates/${id}`);
    }
    await offline.clearPending();
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

export async function loadOfflineFirst() {
  const clients = await offline.getClients();
  const tickets = await offline.getTickets();
  const templates = await offline.getTemplates();
  const lastSync = await offline.getLastSync();
  return { clients, tickets, templates, lastSync };
}
