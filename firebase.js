(() => { 'use strict';

const STORAGE_KEYS = { config: 'kareem3_firebase_config', bridgeState: 'kareem3_firebase_bridge_state', };

const state = { ready: false, mode: 'disabled', // disabled | local | firebase app: null, auth: null, db: null, user: null, listeners: new Set(), lastError: null, };

function safeJSONParse(value, fallback) { try { if (value === null || value === undefined || value === '') return fallback; return JSON.parse(value); } catch { return fallback; } }

function safeJSONStringify(value, fallback = '{}') { try { return JSON.stringify(value); } catch { return fallback; } }

function getStoredConfig() { return safeJSONParse(localStorage.getItem(STORAGE_KEYS.config), null); }

function setStoredConfig(config) { try { localStorage.setItem(STORAGE_KEYS.config, safeJSONStringify(config, '{}')); return true; } catch (err) { console.error('[KAREEM3_DB] save config failed:', err); return false; } }

function getBridgeState() { return safeJSONParse(localStorage.getItem(STORAGE_KEYS.bridgeState), { lastMode: 'disabled', lastError: null, lastSyncAt: null, }); }

function setBridgeState(patch) { const current = getBridgeState(); const next = { ...current, ...patch }; try { localStorage.setItem(STORAGE_KEYS.bridgeState, safeJSONStringify(next, '{}')); } catch (err) { console.error('[KAREEM3_DB] save bridge state failed:', err); } return next; }

function emit(eventName, payload) { state.listeners.forEach((fn) => { try { fn(eventName, payload); } catch (err) { console.error('[KAREEM3_DB] listener error:', err); } }); }

function onEvent(handler) { if (typeof handler !== 'function') return () => {}; state.listeners.add(handler); return () => state.listeners.delete(handler); }

function hasFirebaseSDK() { return typeof window !== 'undefined' && typeof window.firebase !== 'undefined'; }

function getMode() { return state.mode; }

function isReady() { return state.ready; }

function getStatus() { return { ready: state.ready, mode: state.mode, user: state.user, hasSDK: hasFirebaseSDK(), lastError: state.lastError, }; }

function setLocalMode(reason = 'local-fallback') { state.ready = true; state.mode = 'local'; state.lastError = null; setBridgeState({ lastMode: 'local', lastError: null, lastSyncAt: Date.now(), reason }); emit('mode-changed', getStatus()); return getStatus(); }

function setDisabledMode(reason = 'disabled') { state.ready = true; state.mode = 'disabled'; state.user = null; state.lastError = null; setBridgeState({ lastMode: 'disabled', lastError: null, lastSyncAt: Date.now(), reason }); emit('mode-changed', getStatus()); return getStatus(); }

function setFirebaseMode(app, auth, db) { state.ready = true; state.mode = 'firebase'; state.app = app || null; state.auth = auth || null; state.db = db || null; state.lastError = null; setBridgeState({ lastMode: 'firebase', lastError: null, lastSyncAt: Date.now() }); emit('mode-changed', getStatus()); return getStatus(); }

async function tryInitFirebase(config) { if (!config || !config.apiKey || !config.projectId) { throw new Error('Missing Firebase config'); }

if (!hasFirebaseSDK()) {
  throw new Error('Firebase SDK not loaded');
}

if (!window.firebase.apps || !window.firebase.apps.length) {
  const app = window.firebase.initializeApp(config);
  const auth = window.firebase.auth ? window.firebase.auth() : null;
  const db = window.firebase.firestore ? window.firebase.firestore() : null;
  setFirebaseMode(app, auth, db);
  return getStatus();
}

const app = window.firebase.app();
const auth = window.firebase.auth ? window.firebase.auth() : null;
const db = window.firebase.firestore ? window.firebase.firestore() : null;
setFirebaseMode(app, auth, db);
return getStatus();

}

async function init(options = {}) { if (state.ready) return getStatus();

const cfg = options.config || getStoredConfig();
const preferredMode = options.mode || 'auto';

try {
  if (preferredMode === 'disabled') {
    return setDisabledMode('forced-disabled');
  }

  if (preferredMode === 'local') {
    return setLocalMode('forced-local');
  }

  if (cfg && hasFirebaseSDK()) {
    return await tryInitFirebase(cfg);
  }

  return setLocalMode(cfg ? 'sdk-missing' : 'no-config');
} catch (err) {
  state.lastError = err instanceof Error ? err.message : String(err);
  setBridgeState({ lastMode: 'local', lastError: state.lastError, lastSyncAt: Date.now() });
  console.error('[KAREEM3_DB] init failed, falling back to local mode:', err);
  return setLocalMode('init-failed');
}

}

function ensureLocalStorageArray(key) { return safeJSONParse(localStorage.getItem(key), []); }

function ensureLocalStorageObject(key) { return safeJSONParse(localStorage.getItem(key), {}); }

function writeLocalStorage(key, value, fallback = '{}') { try { localStorage.setItem(key, safeJSONStringify(value, fallback)); return true; } catch (err) { state.lastError = err instanceof Error ? err.message : String(err); console.error('[KAREEM3_DB] write failed:', err); return false; } }

async function readDoc(path) { if (state.mode === 'firebase' && state.db) { const snap = await state.db.doc(path).get(); return snap.exists ? snap.data() : null; } return ensureLocalStorageObject(path); }

async function writeDoc(path, data) { if (state.mode === 'firebase' && state.db) { await state.db.doc(path).set(data, { merge: true }); state.lastError = null; emit('write', { path, data }); return true; }

const ok = writeLocalStorage(path, data, '{}');
if (ok) emit('write', { path, data });
return ok;

}

async function addDoc(path, data) { if (state.mode === 'firebase' && state.db) { const ref = await state.db.collection(path).add(data); emit('write', { path, data, id: ref.id }); return ref.id; }

const list = ensureLocalStorageArray(path);
const id = `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
list.push({ id, ...data });
writeLocalStorage(path, list, '[]');
emit('write', { path, data, id });
return id;

}

async function setUser(user) { state.user = user || null; emit('user-changed', state.user); return state.user; }

async function signIn(email, password) { if (state.mode !== 'firebase' || !state.auth) { state.lastError = 'Firebase auth unavailable'; return null; }

const result = await state.auth.signInWithEmailAndPassword(email, password);
await setUser(result.user || null);
return result.user || null;

}

async function signOut() { if (state.mode === 'firebase' && state.auth) { await state.auth.signOut(); } await setUser(null); return true; }

function getConfig() { return getStoredConfig(); }

function saveConfig(config) { return setStoredConfig(config); }

function clearError() { state.lastError = null; setBridgeState({ lastError: null }); }

async function ping() { const status = getStatus(); if (status.mode === 'firebase' && state.db) { try { await state.db.collection('health').limit(1).get(); clearError(); return { ok: true, mode: status.mode }; } catch (err) { state.lastError = err instanceof Error ? err.message : String(err); setBridgeState({ lastError: state.lastError, lastSyncAt: Date.now() }); return { ok: false, mode: status.mode, error: state.lastError }; } }

return { ok: true, mode: status.mode };

}

const api = { init, getStatus, getMode, isReady, getConfig, saveConfig, onEvent, ping, clearError, setLocalMode, setDisabledMode, setFirebaseMode, readDoc, writeDoc, addDoc, signIn, signOut, setUser, };

window.KAREEM3_DB = api;

document.addEventListener('DOMContentLoaded', () => { const config = getStoredConfig(); if (config && !state.ready) { init({ mode: 'auto', config }).catch((err) => { state.lastError = err instanceof Error ? err.message : String(err); setDisabledMode('init-catch'); }); } else { setLocalMode('boot-local'); } }); })();
