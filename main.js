(() => {
  "use strict";

  const KEYS = {
    accounts: "kareem3_accounts",
    publicMessages: "kareem3_publicMessages",
    privateThreads: "kareem3_privateThreads",
    currentSession: "kareem3_currentSession",
    guestSeed: "kareem3_guestSeed",
  };

  const CONFIG = {
    SESSION_TTL_MS: 24 * 60 * 60 * 1000,
    ONLINE_WINDOW_MS: 15 * 60 * 1000,
    FEATURED_WINDOW_MS: 2 * 60 * 60 * 1000,
    PUBLIC_MESSAGE_CAP: 70,
    MAX_NOTIFICATIONS: 20,
    TOAST_MS: 2400,
    MAX_NAME_LENGTH: 40,
  };

  const state = {
    accounts: [],
    publicMessages: [],
    privateThreads: {},
    currentAccountId: null,
    selectedPrivatePeerId: null,
    selectedUserId: null,
    view: "home",
  };

  const els = {};

  const $ = (id) => document.getElementById(id);
  const now = () => Date.now();

  function normalizeText(v) {
    return String(v || "").trim();
  }

  function createId(prefix = "id") {
    return prefix + "_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  /* ===================== STORAGE ===================== */

  function load() {
    state.accounts = JSON.parse(localStorage.getItem(KEYS.accounts) || "[]");
    state.publicMessages = JSON.parse(localStorage.getItem(KEYS.publicMessages) || "[]");
    state.privateThreads = JSON.parse(localStorage.getItem(KEYS.privateThreads) || "{}");

    const session = JSON.parse(localStorage.getItem(KEYS.currentSession) || "null");
    if (session) state.currentAccountId = session.accountId;
  }

  function save() {
    localStorage.setItem(KEYS.accounts, JSON.stringify(state.accounts));
    localStorage.setItem(KEYS.publicMessages, JSON.stringify(state.publicMessages));
    localStorage.setItem(KEYS.privateThreads, JSON.stringify(state.privateThreads));

    if (state.currentAccountId) {
      localStorage.setItem(
        KEYS.currentSession,
        JSON.stringify({ accountId: state.currentAccountId })
      );
    }
  }

  /* ===================== ACCOUNTS ===================== */

  function getCurrentAccount() {
    return state.accounts.find(a => a.id === state.currentAccountId);
  }

  function createGuest() {
    const guest = {
      id: createId("acc"),
      username: "زائر",
      createdAt: now(),
      lastSeenAt: now(),
      profile: { name: "زائر", bio: "حساب تجريبي" }
    };
    state.accounts.push(guest);
    state.currentAccountId = guest.id;
    save();
    return guest;
  }

  /* ===================== PUBLIC CHAT ===================== */

  function addPublicMessage(text) {
    state.publicMessages.push({
      id: createId("msg"),
      text,
      at: now(),
      senderId: state.currentAccountId
    });

    if (state.publicMessages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      state.publicMessages = state.publicMessages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }

    save();
    renderPublic();
  }

  function renderPublic() {
    const box = $("publicMessages");
    if (!box) return;

    box.innerHTML = "";

    state.publicMessages.forEach(m => {
      const div = document.createElement("div");
      div.className = "msg";
      div.textContent = m.text;
      box.appendChild(div);
    });
  }

  /* ===================== PRIVATE CHAT ===================== */

  function getThread(a, b) {
    const key = [a, b].sort().join("__");

    if (!state.privateThreads[key]) {
      state.privateThreads[key] = { messages: [] };
    }

    return state.privateThreads[key];
  }

  function sendPrivate(peerId, text) {
    const me = state.currentAccountId;
    const thread = getThread(me, peerId);

    thread.messages.push({
      id: createId("pmsg"),
      text,
      from: me,
      at: now()
    });

    save();
  }

  /* ===================== UI ===================== */

  function setView(v) {
    state.view = v;

    ["homeView","profileView","privateView","userView"].forEach(id => {
      const el = $(id);
      if (el) el.classList.add("hidden");
    });

    const active = $(v + "View");
    if (active) active.classList.remove("hidden");
  }

  function cache() {
    els.publicForm = $("publicMessageForm");
    els.publicInput = $("publicMessageInput");
    els.privateForm = $("privateMessageForm");
    els.privateInput = $("privateMessageInput");
  }

  function bind() {
    els.publicForm?.addEventListener("submit", e => {
      e.preventDefault();
      const val = els.publicInput.value;
      if (!val) return;
      addPublicMessage(val);
      els.publicInput.value = "";
    });

    $("appTitleBtn")?.addEventListener("click", () => location.reload());
  }

  function init() {
    cache();
    load();

    if (!state.currentAccountId) createGuest();

    bind();
    renderPublic();
    setView("home");
  }

  document.addEventListener("DOMContentLoaded", init);
})();
