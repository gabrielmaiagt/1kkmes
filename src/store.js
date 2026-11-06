import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
const env = import.meta.env;
export const connected = Boolean(env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID && env.VITE_FIREBASE_AUTH_DOMAIN && env.VITE_FIREBASE_APP_ID);
const app = connected ? initializeApp({ apiKey: env.VITE_FIREBASE_API_KEY, authDomain: env.VITE_FIREBASE_AUTH_DOMAIN, projectId: env.VITE_FIREBASE_PROJECT_ID, appId: env.VITE_FIREBASE_APP_ID }) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const resourcePath = resource => ['offers', env.VITE_OFFER_ID || 'oferta-principal', resource];
const resourceKey = resource => `1kk-${resource}-v1`;
const localSessionKey = '1kk-local-session';
const localUser = { email: 'socios@local', uid: 'local' };
const authEvent = '1kk-auth';
export function watchAuth(callback) {
  if (connected) return onAuthStateChanged(auth, callback);
  const update = () => callback(sessionStorage.getItem(localSessionKey) === 'active' ? localUser : null);
  update();
  window.addEventListener(authEvent, update);
  return () => window.removeEventListener(authEvent, update);
}
export async function login(password) {
  if (connected) return signInWithEmailAndPassword(auth, env.VITE_SHARED_LOGIN_EMAIL || 'acesso@planilha1kk.local', password);
  // Local preview only. Production passwords are verified by Firebase Authentication.
  if (password !== '1kk123') throw new Error('Senha incorreta.');
  sessionStorage.setItem(localSessionKey, 'active');
  window.dispatchEvent(new Event(authEvent));
}
export async function logout() {
  if (connected) return signOut(auth);
  sessionStorage.removeItem(localSessionKey);
  window.dispatchEvent(new Event(authEvent));
}
export function subscribe(callback, onError, resource = 'entries') {
  const path = resourcePath(resource), key = resourceKey(resource);
  if (connected) return onSnapshot(collection(db, ...path), snap => callback(snap.docs.map(d => ({ ...d.data(), id: d.id }))), onError);
  try { callback(JSON.parse(localStorage.getItem(key) || '[]')); } catch { onError(new Error('Não foi possível ler os dados locais.')); }
  const listener = e => { if (e.key === key) { try { callback(JSON.parse(e.newValue || '[]')); } catch { onError(new Error('Dados locais inválidos.')); } } };
  window.addEventListener('storage', listener);
  return () => window.removeEventListener('storage', listener);
}
export async function save(entry, entries, resource = 'entries') {
  const path = resourcePath(resource), key = resourceKey(resource);
  if (connected) return setDoc(doc(db, ...path, entry.id), entry);
  const next = [...entries.filter(e => e.id !== entry.id), entry];
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}
export async function remove(id, entries, resource = 'entries') {
  const path = resourcePath(resource), key = resourceKey(resource);
  if (connected) return deleteDoc(doc(db, ...path, id));
  const next = entries.filter(e => e.id !== id);
  localStorage.setItem(key, JSON.stringify(next));
  return next;
}
