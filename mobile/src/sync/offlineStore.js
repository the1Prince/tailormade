import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIX = 'tailormade_';
const KEYS = {
  CLIENTS: `${PREFIX}clients`,
  TICKETS: `${PREFIX}tickets`,
  TEMPLATES: `${PREFIX}templates`,
  PENDING: `${PREFIX}pending`,
  LAST_SYNC: `${PREFIX}lastSync`,
};

export async function getClients() {
  const raw = await AsyncStorage.getItem(KEYS.CLIENTS);
  return raw ? JSON.parse(raw) : [];
}

export async function setClients(clients) {
  await AsyncStorage.setItem(KEYS.CLIENTS, JSON.stringify(clients));
}

export async function getTickets() {
  const raw = await AsyncStorage.getItem(KEYS.TICKETS);
  return raw ? JSON.parse(raw) : [];
}

export async function setTickets(tickets) {
  await AsyncStorage.setItem(KEYS.TICKETS, JSON.stringify(tickets));
}

export async function getTemplates() {
  const raw = await AsyncStorage.getItem(KEYS.TEMPLATES);
  return raw ? JSON.parse(raw) : [];
}

export async function setTemplates(templates) {
  await AsyncStorage.setItem(KEYS.TEMPLATES, JSON.stringify(templates));
}

export async function getPending() {
  const raw = await AsyncStorage.getItem(KEYS.PENDING);
  return raw ? JSON.parse(raw) : { creates: [], updates: [], deletes: [] };
}

export async function setPending(pending) {
  await AsyncStorage.setItem(KEYS.PENDING, JSON.stringify(pending));
}

export async function getLastSync() {
  const raw = await AsyncStorage.getItem(KEYS.LAST_SYNC);
  return raw ? new Date(raw) : null;
}

export async function setLastSync(date) {
  await AsyncStorage.setItem(KEYS.LAST_SYNC, date.toISOString());
}

export async function addPendingCreate(resource, payload) {
  const p = await getPending();
  p.creates.push({ resource, payload, at: new Date().toISOString() });
  await setPending(p);
}

export async function addPendingUpdate(resource, id, payload) {
  const p = await getPending();
  p.updates.push({ resource, id, payload, at: new Date().toISOString() });
  await setPending(p);
}

export async function addPendingDelete(resource, id) {
  const p = await getPending();
  p.deletes.push({ resource, id, at: new Date().toISOString() });
  await setPending(p);
}

export async function clearPending() {
  await setPending({ creates: [], updates: [], deletes: [] });
}
