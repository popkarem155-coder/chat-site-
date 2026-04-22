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
    pendingAction: null,
    monitorPanelEl: null,
    toastHostEl: null,
    activitySaveTimer: null,
    intervalTimer: null,
    view: "home",
    searchQuery: "",
    externalDB: null,
  };

  const els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function now() {
    return Date.now();
  }

  function safeJSONParse(value, fallback) {
    try {
      if (!value) return fallback;
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }

  function safeJSONStringify(value, fallback = "{}") {
    try {
      return JSON.stringify(value);
    } catch {
      return fallback;
    }
  }

  function normalizeText(value) {
    return String(value ?? "").trim().replace(/\s+/g, " ");
  }

  function clampText(value, max = CONFIG.MAX_NAME_LENGTH) {
    return normalizeText(value).slice(0, max);
  }

  function createId(prefix = "id") {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function hashString(str) {
    let h = 0;
    const s = String(str || "");
    for (let i = 0; i < s.length; i++) {
      h = (h << 5) - h + s.charCodeAt(i);
      h |= 0;
    }
    return Math.abs(h);
  }

  function colorFromText(text) {
    const h = hashString(text) % 360;
    return `hsl(${h} 35% 28%)`;
  }

  function formatTime(ts) {
    try {
      return new Date(ts).toLocaleTimeString("ar-EG", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  }

  function timeAgo(ts) {
    const diff = Math.max(0, now() - Number(ts || 0));
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) return "ظ…ظ†ط° ظ„ط­ط¸ط§طھ";
    if (diff < hour) return `ظ…ظ†ط° ${Math.floor(diff / minute)} ط¯ظ‚ظٹظ‚ط©`;
    if (diff < day) return `ظ…ظ†ط° ${Math.floor(diff / hour)} ط³ط§ط¹ط©`;
    return `ظ…ظ†ط° ${Math.floor(diff / day)} ظٹظˆظ…`;
  }

  function durationLabel(ms) {
    const totalMinutes = Math.floor(Math.max(0, ms) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `ظ†ط´ط· ظ…ظ†ط° ${minutes} ط¯ظ‚ظٹظ‚ط©`;
    if (minutes <= 0) return `ظ†ط´ط· ظ…ظ†ط° ${hours} ط³ط§ط¹ط©`;
    return `ظ†ط´ط· ظ…ظ†ط° ${hours} ط³ط§ط¹ط© ظˆ${minutes} ط¯ظ‚ظٹظ‚ط©`;
  }

  function getAccounts() {
    return Array.isArray(state.accounts) ? state.accounts : [];
  }

  function getAccountById(id) {
    return getAccounts().find((acc) => acc.id === id) || null;
  }

  function getAccountByUsername(username) {
    const key = normalizeText(username).toLowerCase();
    if (!key) return null;
    return getAccounts().find((acc) => normalizeText(acc.username).toLowerCase() === key) || null;
  }

  function getDisplayName(account) {
    if (!account) return "ظ…ط³طھط®ط¯ظ…";
    const name = clampText(account.profile?.name || account.username || "ظ…ط³طھط®ط¯ظ…", CONFIG.MAX_NAME_LENGTH);
    return name || "ظ…ط³طھط®ط¯ظ…";
  }

  function getAvatarInitial(account) {
    const name = getDisplayName(account);
    return name ? name[0] : "طں";
  }

  function getCurrentSession() {
    return safeJSONParse(localStorage.getItem(KEYS.currentSession), null);
  }

  function isSessionExpired(session) {
    if (!session || !session.expiresAt) return true;
    return now() > Number(session.expiresAt);
  }

  function getCurrentAccount() {
    if (!state.currentAccountId) return null;
    return getAccountById(state.currentAccountId);
  }

  function isCurrentAccountOnline() {
    const acc = getCurrentAccount();
    if (!acc) return false;

    const session = getCurrentSession();
    if (!session || session.accountId !== acc.id) return false;
    if (isSessionExpired(session)) return false;

    const lastSeen = Number(acc.lastSeenAt || 0);
    return now() - lastSeen <= CONFIG.ONLINE_WINDOW_MS;
  }

  function isCurrentAccountFeatured() {
    const acc = getCurrentAccount();
    if (!acc) return false;
    if (!isCurrentAccountOnline()) return false;

    const session = getCurrentSession();
    const startedAt = Number(session?.startedAt || 0);
    const total = Number(acc.totalActiveMs || 0) + Math.max(0, now() - startedAt);
    return total >= CONFIG.FEATURED_WINDOW_MS;
  }

  function getActiveDurationForAccount(acc) {
    if (!acc) return 0;

    const session = getCurrentSession();
    if (
      session &&
      session.accountId === acc.id &&
      !isSessionExpired(session)
    ) {
      return Number(acc.totalActiveMs || 0) + Math.max(0, now() - Number(session.startedAt || now()));
    }

    return Number(acc.totalActiveMs || 0);
  }

  function setAvatar(el, account, fallbackLabel = "طں") {
    if (!el) return;

    const initial = account ? getAvatarInitial(account) : fallbackLabel;
    const avatarUrl = account?.profile?.avatar || "";

    el.textContent = initial;
    el.style.backgroundImage = "";
    el.style.backgroundSize = "cover";
    el.style.backgroundPosition = "center";
    el.style.backgroundColor = colorFromText(account?.username || fallbackLabel);
    el.style.color = "";

    if (avatarUrl) {
      el.style.backgroundImage = `url("${avatarUrl}")`;
      el.textContent = "";
      el.style.backgroundColor = "#222";
    }
  }

  /* =========================
     ًں’¾ STORAGE SYSTEM
  ========================= */

  function readStorage() {
    state.accounts = safeJSONParse(localStorage.getItem(KEYS.accounts), []);
    state.publicMessages = safeJSONParse(localStorage.getItem(KEYS.publicMessages), []);
    state.privateThreads = safeJSONParse(localStorage.getItem(KEYS.privateThreads), {});
  }

  function writeStorage() {
    try {
      localStorage.setItem(KEYS.accounts, safeJSONStringify(state.accounts, "[]"));
      localStorage.setItem(KEYS.publicMessages, safeJSONStringify(state.publicMessages, "[]"));
      localStorage.setItem(KEYS.privateThreads, safeJSONStringify(state.privateThreads, "{}"));

      if (state.currentAccountId) {
        const acc = getCurrentAccount();
        if (acc) {
          localStorage.setItem(
            KEYS.currentSession,
            safeJSONStringify({
              accountId: state.currentAccountId,
              startedAt: acc.sessionStartedAt || now(),
              expiresAt: acc.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS),
            }, "{}")
          );
        }
      } else {
        localStorage.removeItem(KEYS.currentSession);
      }
    } catch (err) {
      showToast("طھط¹ط°ط± ط­ظپط¸ ط§ظ„ط¨ظٹط§ظ†ط§طھ. طھط£ظƒط¯ ط£ظ† ظ…ط³ط§ط­ط© ط§ظ„طھط®ط²ظٹظ† ظ…طھط§ط­ط©.");
      console.error(err);
    }
  }

  function prunePublicMessages() {
    if (!Array.isArray(state.publicMessages)) state.publicMessages = [];
    if (state.publicMessages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      state.publicMessages = state.publicMessages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }
  }

  function pruneNotifications(acc) {
    if (!acc) return;
    if (!Array.isArray(acc.notifications)) acc.notifications = [];
    if (acc.notifications.length > CONFIG.MAX_NOTIFICATIONS) {
      acc.notifications = acc.notifications.slice(-CONFIG.MAX_NOTIFICATIONS);
    }
  }

  function normalizeThread(thread) {
    if (!thread || typeof thread !== "object") return null;

    const messages = Array.isArray(thread.messages) ? thread.messages : [];
    return {
      participants: Array.isArray(thread.participants) ? thread.participants : [],
      messages,
      updatedAt: Number(thread.updatedAt || 0),
    };
  }

  function prunePrivateThreads() {
    const cleaned = {};
    Object.entries(state.privateThreads || {}).forEach(([key, thread]) => {
      const t = normalizeThread(thread);
      if (!t) return;

      if (t.messages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
        t.messages = t.messages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
      }

      cleaned[key] = t;
    });
    state.privateThreads = cleaned;
  }

  function getThreadKey(a, b) {
    return [a, b].sort().join("__");
  }

  function getThread(a, b, createIfMissing = false) {
    if (!a || !b) return null;

    const key = getThreadKey(a, b);
    let thread = normalizeThread(state.privateThreads[key]);

    if (!thread && createIfMissing) {
      thread = {
        participants: [a, b],
        messages: [],
        updatedAt: now(),
      };
      state.privateThreads[key] = thread;
      return thread;
    }

    if (!thread) return null;

    state.privateThreads[key] = thread;
    return thread;
  }

  /* =========================
     ًں”گ AUTH SYSTEM
  ========================= */

  function seedGuestAccount() {
    const guestSeed =
      safeJSONParse(localStorage.getItem(KEYS.guestSeed), null) || {
        id: createId("acc"),
        createdAt: now(),
      };

    try {
      localStorage.setItem(KEYS.guestSeed, safeJSONStringify(guestSeed, "{}"));
    } catch {}

    const existing = getAccountById(guestSeed.id);
    if (existing) return existing;

    const guest = {
      id: guestSeed.id,
      username: "ط²ط§ط¦ط±",
      password: "",
      createdAt: guestSeed.createdAt,
      lastSeenAt: now(),
      totalActiveMs: 0,
      sessionStartedAt: now(),
      sessionExpiresAt: now() + CONFIG.SESSION_TTL_MS,
      profile: {
        name: "ط²ط§ط¦ط±",
        age: "",
        gender: "",
        nationality: "",
        bio: "ط­ط³ط§ط¨ ط§ظپطھط±ط§ط¶ظٹ ظ„ظ„طھط¬ط±ط¨ط©.",
        avatar: "",
      },
      notifications: [],
      isDemo: true,
    };

    state.accounts.push(guest);
    pruneNotifications(guest);
    return guest;
  }

  function ensureCurrentAccount() {
    const session = getCurrentSession();

    if (session && session.accountId) {
      const acc = getAccountById(session.accountId);
      if (acc && !isSessionExpired(session)) {
        state.currentAccountId = acc.id;
        acc.sessionStartedAt = Number(session.startedAt || now());
        acc.sessionExpiresAt = Number(session.expiresAt || (now() + CONFIG.SESSION_TTL_MS));
        acc.lastSeenAt = acc.lastSeenAt || now();
        return acc;
      }
    }

    const guest = seedGuestAccount();
    state.currentAccountId = guest.id;
    localStorage.setItem(
      KEYS.currentSession,
      safeJSONStringify({
        accountId: guest.id,
        startedAt: now(),
        expiresAt: now() + CONFIG.SESSION_TTL_MS,
      }, "{}")
    );
    return guest;
  }

  function createAccount(username, password = "") {
    const name = clampText(username, CONFIG.MAX_NAME_LENGTH);
    const pass = String(password || "").trim();

    const existing = getAccountByUsername(name);
    if (existing) return existing;

    const account = {
      id: createId("acc"),
      username: name,
      password: pass,
      createdAt: now(),
      lastSeenAt: now(),
      totalActiveMs: 0,
      sessionStartedAt: now(),
      sessionExpiresAt: now() + CONFIG.SESSION_TTL_MS,
      profile: {
        name: name,
        age: "",
        gender: "",
        nationality: "",
        bio: "",
        avatar: "",
      },
      notifications: [],
      isDemo: false,
    };

    state.accounts.push(account);
    pruneNotifications(account);
    return account;
  }

  function loginAccount(account) {
    if (!account) return;

    const startedAt = now();
    account.lastSeenAt = startedAt;
    account.sessionStartedAt = startedAt;
    account.sessionExpiresAt = startedAt + CONFIG.SESSION_TTL_MS;

    state.currentAccountId = account.id;

    localStorage.setItem(
      KEYS.currentSession,
      safeJSONStringify(
        {
          accountId: account.id,
          startedAt,
          expiresAt: account.sessionExpiresAt,
        },
        "{}"
      )
    );

    writeStorage();
    renderAll?.();

    if (state.externalDB?.setUser) {
      state.externalDB
        .setUser({
          id: account.id,
          name: getDisplayName(account),
        })
        .catch?.(() => {});
    }
  }

  function commitCurrentSession(force = false) {
    const acc = getCurrentAccount();
    const session = getCurrentSession();

    if (!acc || !session) return;

    const duration = Math.max(0, now() - Number(session.startedAt || now()));
    if (duration > 0 || force) {
      acc.totalActiveMs = Number(acc.totalActiveMs || 0) + duration;
    }

    acc.lastSeenAt = now();
    acc.sessionStartedAt = null;
    acc.sessionExpiresAt = null;

    localStorage.removeItem(KEYS.currentSession);
    state.currentAccountId = null;
    writeStorage();
  }

  function logoutCurrentAccount(showMessage = true) {
    commitCurrentSession(true);
    state.selectedPrivatePeerId = null;
    state.selectedUserId = null;

    if (showMessage) showToast("طھظ… طھط³ط¬ظٹظ„ ط§ظ„ط®ط±ظˆط¬.");
    renderAll?.();
  }

  function markActivity() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();

    if (!acc || !session || session.accountId !== acc.id) return;

    if (isSessionExpired(session)) {
      logoutCurrentAccount(false);
      showToast("ط§ظ†طھظ‡طھ ط§ظ„ط¬ظ„ط³ط©طŒ ط³ط¬ظ„ ط¯ط®ظˆظ„ ظ…ط±ط© ط£ط®ط±ظ‰.");
      return;
    }

    acc.lastSeenAt = now();

    if (state.activitySaveTimer) return;

    state.activitySaveTimer = setTimeout(() => {
      state.activitySaveTimer = null;
      writeStorage();
      renderShellState?.();
    }, 900);
  }

  function canUseCurrentSession() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();

    if (!acc || !session) return false;
    if (session.accountId !== acc.id) return false;
    if (isSessionExpired(session)) return false;

    return true;
  }

  function requireAuth(action) {
    state.pendingAction = action || null;
    return canUseCurrentSession();
  }

  function showToast(message) {
    if (!state.toastHostEl) {
      state.toastHostEl = document.createElement("div");
      state.toastHostEl.id = "toastHost";
      state.toastHostEl.className = "toast-host";
      document.body.appendChild(state.toastHostEl);
    }

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    state.toastHostEl.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add("is-visible");
    });

    setTimeout(() => {
      toast.classList.remove("is-visible");
      setTimeout(() => toast.remove(), 220);
    }, CONFIG.TOAST_MS);
  }

  function getCurrentPublicMessages() {
    return Array.isArray(state.publicMessages) ? state.publicMessages : [];
  }

  /* =========================
     ًں’¬ CHAT SYSTEM
  ========================= */

  function addPublicMessage(text, senderId = null, senderLabel = "ظ…ط³طھط®ط¯ظ…") {
    const message = {
      id: createId("msg"),
      senderId,
      senderLabel: senderLabel || "ظ…ط³طھط®ط¯ظ…",
      text: normalizeText(text),
      at: now(),
    };

    state.publicMessages.push(message);
    prunePublicMessages();
    writeStorage();
    renderPublicMessages();
    renderShellState();
    return message;
  }

  function getThreadMessagesForPeer(peerId) {
    const current = getCurrentAccount();
    if (!current || !peerId) return [];

    const thread = getThread(current.id, peerId, false);
    return Array.isArray(thread?.messages) ? thread.messages : [];
  }

  function getPrivateChatsForCurrentUser() {
    const current = getCurrentAccount();
    if (!current) return [];

    return Object.entries(state.privateThreads || {})
      .map(([key, thread]) => {
        const t = normalizeThread(thread);
        if (!t || !Array.isArray(t.participants)) return null;
        if (!t.participants.includes(current.id)) return null;

        const peerId = t.participants.find((id) => id !== current.id);
        const peer = getAccountById(peerId);

        const lastMessage =
          Array.isArray(t.messages) && t.messages.length
            ? t.messages[t.messages.length - 1]
            : null;

        return {
          key,
          thread: t,
          peerId,
          peer,
          lastMessage,
          updatedAt: Number(
            t.updatedAt || lastMessage?.at || lastMessage?.time || 0
          ),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function addPrivateMessage(peerId, text, senderId = null, senderLabel = "ظ…ط³طھط®ط¯ظ…") {
    const current = getCurrentAccount();
    if (!current || !peerId) return null;

    const thread = getThread(current.id, peerId, true);
    if (!thread) return null;

    const message = {
      id: createId("pmsg"),
      senderId,
      senderLabel: senderLabel || "ظ…ط³طھط®ط¯ظ…",
      text: normalizeText(text),
      at: now(),
    };

    thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
    thread.messages.push(message);

    if (thread.messages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      thread.messages = thread.messages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }

    thread.updatedAt = now();
    state.privateThreads[getThreadKey(current.id, peerId)] = thread;
    prunePrivateThreads();
    writeStorage();
    renderPrivateChatsList?.();
    renderPrivateConversation?.();
    renderShellState?.();
    return message;
  }

  function notifyProfileViewed(targetAccountId, viewerLabel, viewerId = null) {
    const target = getAccountById(targetAccountId);
    if (!target) return;
    if (viewerId && viewerId === targetAccountId) return;

    if (!Array.isArray(target.notifications)) target.notifications = [];
    target.notifications.push({
      id: createId("noti"),
      type: "profile_view",
      viewerId,
      viewerLabel: normalizeText(viewerLabel) || "ط²ط§ط¦ط±",
      at: now(),
      read: false,
    });

    pruneNotifications(target);
    writeStorage();
  }

  function markCurrentNotificationsRead() {
    const acc = getCurrentAccount();
    if (!acc || !Array.isArray(acc.notifications)) return;

    acc.notifications.forEach((n) => {
      n.read = true;
    });

    writeStorage();
    renderMonitorPanel?.();
    renderShellState?.();
  }

  function getUnreadNotificationCount() {
    const acc = getCurrentAccount();
    if (!acc || !Array.isArray(acc.notifications)) return 0;
    return acc.notifications.filter((n) => !n.read).length;
  }

  function getMonitorItems() {
    const acc = getCurrentAccount();
    if (!acc || !Array.isArray(acc.notifications)) return [];
    return [...acc.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  }

  function openHome() {
    state.selectedUserId = null;
    state.selectedPrivatePeerId = state.selectedPrivatePeerId || null;
    setView("home");
  }

  function closeDrawer() {
    if (!els.menuDrawer) return;
    els.menuDrawer.classList.add("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "true");
  }

  function openDrawer() {
    if (!els.menuDrawer) return;
    els.menuDrawer.classList.remove("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "false");
  }

  function toggleDrawer() {
    if (!els.menuDrawer) return;
    if (els.menuDrawer.classList.contains("is-hidden")) openDrawer();
    else closeDrawer();
  }

  function setView(viewName) {
    state.view = viewName;

    const sections = {
      home: els.homeView,
      profile: els.profileView,
      private: els.privateView,
      user: els.userView,
    };

    Object.entries(sections).forEach(([name, el]) => {
      if (!el) return;
      el.classList.toggle("is-hidden", name !== viewName);
    });

    if (els.app) els.app.dataset.view = viewName;
    closeDrawer();

    if (viewName === "home") {
      renderHomeView();
    } else if (viewName === "profile") {
      renderProfileView();
    } else if (viewName === "private") {
      renderPrivateChatsList();
      renderPrivateConversation();
    } else if (viewName === "user") {
      renderUserView();
    }
  }

  function openMonitorPanel() {
    if (!canUseCurrentSession()) return;

    openDrawer();
    markCurrentNotificationsRead();
    renderMonitorPanel();
    if (state.monitorPanelEl) {
      state.monitorPanelEl.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }

  function openProfile() {
    if (!canUseCurrentSession()) return;
    state.selectedUserId = null;
    setView("profile");
  }

  function openUserProfileById(userId) {
    if (!userId) return;

    const target = getAccountById(userId);
    if (!target) {
      showToast("ط§ظ„ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ظˆط¬ظˆط¯.");
      return;
    }

    const current = getCurrentAccount();
    const viewerLabel = current ? getDisplayName(current) : "ط²ط§ط¦ط±";

    if (current && current.id === target.id) {
      openProfile();
      return;
    }

    state.selectedUserId = target.id;
    notifyProfileViewed(target.id, viewerLabel, current?.id || null);
    setView("user");
    renderUserView();
    renderMonitorPanel();
  }

  function openAccountProfileById(userId) {
    openUserProfileById(userId);
  }

  function openPrivateChat(peerId, silent = false) {
    const peer = getAccountById(peerId);

    if (!peer) {
      if (!silent) showToast("ط§ظ„ط´ط®طµ ط؛ظٹط± ظ…ظˆط¬ظˆط¯.");
      return;
    }

    state.selectedPrivatePeerId = peer.id;
    state.selectedUserId = null;
    setView("private");
    renderPrivateConversation();
    renderPrivateChatsList();
    setTimeout(() => {
      els.privateMessageInput?.focus?.();
    }, 20);
  }

  function sendPublicMessage(text, silent = false) {
    const messageText = normalizeText(text);

    if (!messageText) {
      if (!silent) showToast("ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط£ظˆظ„ط§ظ‹.");
      return false;
    }

    const current = getCurrentAccount();
    if (!current) {
      if (!silent) showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
      return false;
    }

    addPublicMessage(messageText, current.id, getDisplayName(current));
    markActivity();
    return true;
  }

  function sendPrivateMessage(peerId, text, silent = false) {
    const messageText = normalizeText(text);

    if (!peerId) {
      if (!silent) showToast("ط§ط®طھط± ط´ط®طµ ط£ظˆظ„ط§ظ‹.");
      return false;
    }

    if (!messageText) {
      if (!silent) showToast("ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط£ظˆظ„ط§ظ‹.");
      return false;
    }

    const current = getCurrentAccount();
    const peer = getAccountById(peerId);

    if (!current || !peer) {
      if (!silent) showToast("طھط¹ط°ط± ط¥ط±ط³ط§ظ„ ط§ظ„ط±ط³ط§ظ„ط©.");
      return false;
    }

    addPrivateMessage(peerId, messageText, current.id, getDisplayName(current));
    markActivity();
    return true;
  }

  /* =========================
     ًںژ¨ UI RENDERING
  ========================= */

  function renderShellState() {
    const current = getCurrentAccount();
    const online = isCurrentAccountOnline();
    const featured = isCurrentAccountFeatured();

    if (els.currentUserState) {
      if (!current) {
        els.currentUserState.textContent = "ط²ط§ط¦ط±";
      } else if (online) {
        els.currentUserState.textContent = `${getDisplayName(current)} â€¢ ظ…طھطµظ„ ط§ظ„ط¢ظ†`;
      } else {
        els.currentUserState.textContent = `${getDisplayName(current)} â€¢ ط؛ظٹط± ظ†ط´ط·`;
      }
    }

    if (els.menuUserName) {
      els.menuUserName.textContent = current ? getDisplayName(current) : "ظ…ظ„ظپظٹ ط§ظ„ط´ط®طµظٹ";
    }

    if (els.menuUserMeta) {
      els.menuUserMeta.textContent = current
        ? `ط§ط¶ط؛ط· ظ„ظپطھط­ ط§ظ„ظ…ظ„ظپ ظˆطھط¹ط¯ظٹظ„ ط§ظ„ط¨ظٹط§ظ†ط§طھ â€¢ ${featured ? "ظ…ط³طھط®ط¯ظ… ظ…ظ…ظٹط²" : "ط­ط³ط§ط¨ ط¹ط§ط¯ظٹ"}`
        : "ط³ط¬ظ„ ط¯ط®ظˆظ„ ط£ظˆ ط£ظ†ط´ط¦ ط­ط³ط§ط¨ طھط¬ط±ظٹط¨ظٹ";
    }

    if (els.menuAvatar) {
      setAvatar(els.menuAvatar, current, current ? getAvatarInitial(current) : "ط²");
    }

    if (els.profileMonitorCount) els.profileMonitorCount.textContent = String(getUnreadNotificationCount());
    if (els.drawerMonitorBadge) els.drawerMonitorBadge.textContent = String(getUnreadNotificationCount());

    if (els.publicMessageInput) {
      els.publicMessageInput.placeholder = current
        ? "ط§ظƒطھط¨ ط±ط³ط§ظ„طھظƒ ظپظٹ ط§ظ„ط´ط§طھ ط§ظ„ط¹ط§ظ…"
        : "ط¬ظ‡ط² ط­ط³ط§ط¨ ط£ظˆظ„ط§ظ‹";
    }

    if (els.publicSendBtn) els.publicSendBtn.textContent = "ط¥ط±ط³ط§ظ„";
    if (els.privateSendBtn) els.privateSendBtn.textContent = "ط¥ط±ط³ط§ظ„";
  }

  function buildMessageElement(message) {
    const sender = getAccountById(message.senderId);
    const senderName = normalizeText(sender ? getDisplayName(sender) : message.senderLabel || "ظ…ط³طھط®ط¯ظ…");

    const article = document.createElement("article");
    article.className = "message-item";
    if (message.senderId && state.currentAccountId && message.senderId === state.currentAccountId) {
      article.classList.add("is-own");
    }

    const head = document.createElement("div");
    head.className = "message-head";

    const avatar = document.createElement("button");
    avatar.type = "button";
    avatar.className = "message-avatar";
    setAvatar(avatar, sender, senderName ? senderName[0] : "طں");
    avatar.title = `ظپطھط­ ظ…ظ„ظپ ${senderName}`;
    avatar.addEventListener("click", () => {
      if (message.senderId) openAccountProfileById(message.senderId);
    });

    const metaWrap = document.createElement("div");
    metaWrap.className = "message-meta-wrap";

    const senderBtn = document.createElement("button");
    senderBtn.type = "button";
    senderBtn.className = "message-sender";
    senderBtn.textContent = senderName;
    senderBtn.addEventListener("click", () => {
      if (message.senderId) openAccountProfileById(message.senderId);
    });

    const time = document.createElement("time");
    time.className = "message-time";
    time.dateTime = new Date(message.at).toISOString();
    time.textContent = formatTime(message.at);

    metaWrap.appendChild(senderBtn);
    metaWrap.appendChild(time);
    head.appendChild(avatar);
    head.appendChild(metaWrap);

    const body = document.createElement("p");
    body.className = "message-text";
    body.textContent = message.text || "";

    article.appendChild(head);
    article.appendChild(body);
    return article;
  }

  function renderPublicMessages() {
    if (!els.publicMessages) return;
    els.publicMessages.innerHTML = "";

    const messages = getCurrentPublicMessages();
    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "messages-placeholder";
      empty.textContent = "ظ„ط³ظ‡ ظ…ط§ ظپظٹط´ ط±ط³ط§ط¦ظ„ ط¸ط§ظ‡ط±ط© ظ‡ظ†ط§.";
      els.publicMessages.appendChild(empty);
      return;
    }

    messages.forEach((message) => {
      els.publicMessages.appendChild(buildMessageElement(message));
    });

    els.publicMessages.scrollTop = els.publicMessages.scrollHeight;
  }

  function renderOnlineUsers() {
    if (!els.onlineUsersList || !els.onlineUsersEmpty) return;

    const list = [];
    const current = getCurrentAccount();
    if (current && isCurrentAccountOnline()) list.push(current);

    els.onlineUsersList.innerHTML = "";
    if (!list.length) {
      els.onlineUsersEmpty.classList.remove("is-hidden");
      return;
    }

    els.onlineUsersEmpty.classList.add("is-hidden");
    list.forEach((acc) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "user-row";
      row.setAttribute("role", "listitem");

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement("div");
      info.className = "user-row-info";

      const name = document.createElement("strong");
      name.textContent = getDisplayName(acc);

      const sub = document.createElement("span");
      sub.textContent = "ظ…طھطµظ„ ط§ظ„ط¢ظ†";

      info.appendChild(name);
      info.appendChild(sub);

      const badge = document.createElement("span");
      badge.className = "online-badge";
      badge.textContent = "â—ڈ";

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(badge);
      row.addEventListener("click", () => openAccountProfileById(acc.id));

      els.onlineUsersList.appendChild(row);
    });
  }

  function renderFeaturedUsers() {
    if (!els.featuredUsersList || !els.featuredUsersEmpty) return;

    const list = [];
    const current = getCurrentAccount();
    if (current && isCurrentAccountFeatured()) list.push(current);

    els.featuredUsersList.innerHTML = "";
    if (!list.length) {
      els.featuredUsersEmpty.classList.remove("is-hidden");
      return;
    }

    els.featuredUsersEmpty.classList.add("is-hidden");
    list.forEach((acc) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "user-row featured-row";
      row.setAttribute("role", "listitem");

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement("div");
      info.className = "user-row-info";

      const nameLine = document.createElement("div");
      nameLine.className = "featured-name-line";

      const name = document.createElement("strong");
      name.textContent = getDisplayName(acc);

      const star = document.createElement("span");
      star.className = "featured-badge";
      star.textContent = "âک…";

      nameLine.appendChild(name);
      nameLine.appendChild(star);

      const sub = document.createElement("span");
      sub.textContent = durationLabel(getActiveDurationForAccount(acc));

      info.appendChild(nameLine);
      info.appendChild(sub);
      row.appendChild(avatar);
      row.appendChild(info);
      row.addEventListener("click", () => openAccountProfileById(acc.id));

      els.featuredUsersList.appendChild(row);
    });
  }

  function renderHomeView() {
    renderShellState();
    renderPublicMessages();
    renderOnlineUsers();
    renderFeaturedUsers();
    renderPrivateChatsList();
    renderMonitorPanel();
    renderUserSearchResults();
  }

  function renderProfileView() {
    const current = getCurrentAccount();
    if (!current) return;

    if (els.profileName) els.profileName.value = current.username || "";
    if (els.profilePassword) els.profilePassword.value = current.password || "";
    if (els.profileAge) els.profileAge.value = current.profile?.age || "";
    if (els.profileGender) els.profileGender.value = current.profile?.gender || "";
    if (els.profileNationality) els.profileNationality.value = current.profile?.nationality || "";
    if (els.profileBio) els.profileBio.value = current.profile?.bio || "";

    if (els.profileAvatarPreview) setAvatar(els.profileAvatarPreview, current, getAvatarInitial(current));
    if (els.profileOnlineState) {
      els.profileOnlineState.textContent = isCurrentAccountOnline() ? "ظ…طھطµظ„ ط§ظ„ط¢ظ†" : "ط؛ظٹط± ظ†ط´ط·";
    }

    if (els.profileLastSeen) {
      els.profileLastSeen.textContent = current.lastSeenAt
        ? `${durationLabel(getActiveDurationForAccount(current))} â€¢ ط¢ط®ط± ط¸ظ‡ظˆط± ${timeAgo(current.lastSeenAt)}`
        : "ظ„ط§ ظٹظˆط¬ط¯ ظ†ط´ط§ط· ظ…ط³ط¬ظ„";
    }
  }

  function renderPrivateChatsList() {
    if (!els.privateChatsList || !els.privateChatsEmpty) return;

    const current = getCurrentAccount();
    els.privateChatsList.innerHTML = "";

    if (!current) {
      els.privateChatsEmpty.classList.remove("is-hidden");
      els.privateChatsEmpty.textContent = "ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط· ط­ط§ظ„ظٹط§ظ‹.";
      return;
    }

    const chats = getPrivateChatsForCurrentUser();
    if (!chats.length) {
      els.privateChatsEmpty.classList.remove("is-hidden");
      els.privateChatsEmpty.textContent = "ظ„ط³ظ‡ ظ…ط§ ظƒظ„ظ…طھط´ ط­ط¯ ظپظٹ ط§ظ„ط®ط§طµ.";
      return;
    }

    els.privateChatsEmpty.classList.add("is-hidden");

    chats.forEach((item) => {
      const peer = item.peer;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "private-chat-item";
      if (state.selectedPrivatePeerId && state.selectedPrivatePeerId === item.peerId) {
        btn.classList.add("is-active");
      }

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      setAvatar(avatar, peer, peer ? getAvatarInitial(peer) : "طں");

      const info = document.createElement("div");
      info.className = "private-chat-item-info";

      const name = document.createElement("strong");
      name.textContent = peer ? getDisplayName(peer) : "ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ط¹ط±ظˆظپ";

      const preview = document.createElement("span");
      const lastMessage = item.lastMessage;
      preview.textContent = lastMessage
        ? (lastMessage.senderId === current.id ? "ط£ظ†طھ: " : "") + (lastMessage.text || "")
        : "ط§ط¨ط¯ط£ ط§ظ„ظ…ط­ط§ط¯ط«ط©";

      info.appendChild(name);
      info.appendChild(preview);

      const time = document.createElement("time");
      time.className = "private-chat-item-time";
      time.textContent = lastMessage ? formatTime(lastMessage.at) : "";

      btn.appendChild(avatar);
      btn.appendChild(info);
      btn.appendChild(time);
      btn.addEventListener("click", () => {
        if (item.peerId) openPrivateChat(item.peerId, true);
      });

      els.privateChatsList.appendChild(btn);
    });
  }

  function renderPrivateConversation() {
    if (!els.privateMessages || !els.privateChatTitle || !els.privateChatMeta || !els.privateChatAvatar) return;

    const current = getCurrentAccount();
    const peer = getAccountById(state.selectedPrivatePeerId);

    if (!current) {
      els.privateChatTitle.textContent = "ظ„ط§ طھظˆط¬ط¯ ظ…ط­ط§ط¯ط«ط©";
      els.privateChatMeta.textContent = "ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.";
      setAvatar(els.privateChatAvatar, null, "طں");
      els.privateMessages.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط· ط­ط§ظ„ظٹط§ظ‹.";
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = "ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·";
      if (els.privateSendBtn) els.privateSendBtn.disabled = true;
      return;
    }

    if (!peer) {
      els.privateChatTitle.textContent = "ط§ط®طھط§ط± ط´ط®طµ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط©";
      els.privateChatMeta.textContent = "ظ‡ظ†ط§ ظ‡طھط¸ظ‡ط± ط§ظ„ظ…ط­ط§ط¯ط«ط© ظƒط§ظ…ظ„ط©.";
      setAvatar(els.privateChatAvatar, null, "طں");
      els.privateMessages.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "ط§ط®طھط§ط± ط´ط®طµ ظ…ظ† ط§ظ„ظ‚ط§ط¦ظ…ط© ط£ظˆ ظ…ظ† ط§ظ„ط¨ط­ط«.";
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = "ط§ظƒطھط¨ ط±ط³ط§ظ„طھظƒ ط§ظ„ط®ط§طµط©...";
      if (els.privateSendBtn) els.privateSendBtn.disabled = true;
      return;
    }

    els.privateChatTitle.textContent = getDisplayName(peer);
    els.privateChatMeta.textContent = peer.lastSeenAt
      ? `${isCurrentAccountOnline() && state.selectedPrivatePeerId === peer.id ? "ظ…طھطµظ„ ط§ظ„ط¢ظ†" : "ط¢ط®ط± ط¸ظ‡ظˆط±"} ${timeAgo(peer.lastSeenAt)}`
      : "ظ…ط³طھط®ط¯ظ… ط¬ط¯ظٹط¯";

    setAvatar(els.privateChatAvatar, peer, getAvatarInitial(peer));
    if (els.privateSendBtn) els.privateSendBtn.disabled = false;
    if (els.privateMessageInput) {
      els.privateMessageInput.placeholder = `ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط¥ظ„ظ‰ ${getDisplayName(peer)}...`;
    }

    const messages = getThreadMessagesForPeer(peer.id);
    els.privateMessages.innerHTML = "";

    if (!messages.length) {
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "ظ…ط§ ظپظٹط´ ط±ط³ط§ط¦ظ„ ظ„ط³ظ‡. ط§ط¨ط¯ط£ ط£ظˆظ„ ط±ط³ط§ظ„ط©.";
      els.privateMessages.appendChild(placeholder);
      return;
    }

    messages.forEach((message) => {
      els.privateMessages.appendChild(buildMessageElement(message));
    });

    els.privateMessages.scrollTop = els.privateMessages.scrollHeight;
  }

  function renderUserView() {
    const target = getAccountById(state.selectedUserId);
    if (!target) {
      if (els.userViewTitle) els.userViewTitle.textContent = "ظ…ظ„ظپ ط§ظ„ظ…ط³طھط®ط¯ظ…";
      if (els.userViewName) els.userViewName.textContent = "ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ…";
      if (els.userViewStatus) els.userViewStatus.textContent = "ط§ظ„ظ…ط³طھط®ط¯ظ… ط؛ظٹط± ظ…ظˆط¬ظˆط¯";
      if (els.userViewBio) els.userViewBio.textContent = "ظ„ط§ طھظˆط¬ط¯ ط¨ظٹط§ظ†ط§طھ.";
      setAvatar(els.userViewAvatar, null, "طں");
      return;
    }

    if (els.userViewTitle) els.userViewTitle.textContent = `ظ…ظ„ظپ ${getDisplayName(target)}`;
    if (els.userViewName) els.userViewName.textContent = getDisplayName(target);
    if (els.userViewAge) els.userViewAge.textContent = target.profile?.age || "â€”";
    if (els.userViewGender) els.userViewGender.textContent = target.profile?.gender || "â€”";
    if (els.userViewNationality) els.userViewNationality.textContent = target.profile?.nationality || "â€”";
    if (els.userViewBio) els.userViewBio.textContent = target.profile?.bio || "ظ„ط§ طھظˆط¬ط¯ ظ†ط¨ط°ط© ط¨ط¹ط¯.";

    if (els.userViewStatus) {
      const online = target.id === state.currentAccountId && isCurrentAccountOnline();
      if (online) {
        els.userViewStatus.textContent = "ظ…طھطµظ„ ط§ظ„ط¢ظ†";
      } else if (target.lastSeenAt) {
        els.userViewStatus.textContent = `ط¢ط®ط± ط¸ظ‡ظˆط± ${timeAgo(target.lastSeenAt)}`;
      } else {
        els.userViewStatus.textContent = "ط؛ظٹط± ظ…ط­ط¯ط¯";
      }
    }

    if (els.userViewActivity) {
      els.userViewActivity.textContent = durationLabel(getActiveDurationForAccount(target));
    }

    setAvatar(els.userViewAvatar, target, getAvatarInitial(target));
    if (els.startPrivateChatBtn) {
      els.startPrivateChatBtn.dataset.targetId = target.id;
      els.startPrivateChatBtn.textContent = "ظپطھط­ ط´ط§طھ ط®ط§طµ";
    }
  }

  function renderMonitorPanel() {
    if (!state.monitorPanelEl) return;

    const current = getCurrentAccount();
    const unreadCount = getUnreadNotificationCount();
    if (els.profileMonitorCount) els.profileMonitorCount.textContent = String(unreadCount);
    if (els.drawerMonitorBadge) els.drawerMonitorBadge.textContent = String(unreadCount);

    const titleEl = state.monitorPanelEl.querySelector("[data-monitor-title]");
    const countEl = state.monitorPanelEl.querySelector("[data-monitor-count]");
    const listEl = state.monitorPanelEl.querySelector("[data-monitor-list]");
    const emptyEl = state.monitorPanelEl.querySelector("[data-monitor-empty]");

    if (!titleEl || !countEl || !listEl || !emptyEl) return;

    listEl.innerHTML = "";
    countEl.textContent = String(unreadCount);

    if (!current) {
      titleEl.textContent = "ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ";
      emptyEl.textContent = "ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.";
      emptyEl.classList.remove("is-hidden");
      return;
    }

    titleEl.textContent = "ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ";
    const items = getMonitorItems();

    if (!items.length) {
      emptyEl.textContent = "ظ…ط§ ظپظٹط´ ط²ظٹط§ط±ط§طھ ظ„ظ…ظ„ظپظƒ ظ„ط³ظ‡.";
      emptyEl.classList.remove("is-hidden");
      return;
    }

    emptyEl.classList.add("is-hidden");
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "monitor-item";

      const icon = document.createElement("div");
      icon.className = "monitor-item-icon";
      icon.textContent = "ًں‘€";

      const info = document.createElement("div");
      info.className = "monitor-item-info";

      const title = document.createElement("strong");
      title.textContent = item.viewerLabel || "ط²ط§ط¦ط±";

      const sub = document.createElement("span");
      sub.textContent = `${timeAgo(item.at)} â€¢ ط²ط§ط± ظ…ظ„ظپظƒ`;

      info.appendChild(title);
      info.appendChild(sub);
      row.appendChild(icon);
      row.appendChild(info);
      listEl.appendChild(row);
    });
  }

  function renderUserSearchResults() {
    if (!els.userSearchResults || !els.searchResultCount) return;

    const query = normalizeText(els.userSearchInput?.value || "");
    state.searchQuery = query;

    els.userSearchResults.innerHTML = "";

    if (!query) {
      els.searchResultCount.textContent = "0";
      const empty = document.createElement("div");
      empty.className = "empty-state empty-state-small";
      empty.textContent = "ط§ظƒطھط¨ ط§ط³ظ… ط§ظ„ظ…ط³طھط®ط¯ظ… ط¹ط´ط§ظ† ظٹط¸ظ‡ط± ظپظٹ ط§ظ„ظ†طھط§ط¦ط¬.";
      els.userSearchResults.appendChild(empty);
      return;
    }

    const q = query.toLowerCase();
    const results = getAccounts().filter((acc) => {
      const name = normalizeText(acc.username).toLowerCase();
      const profileName = normalizeText(acc.profile?.name || "").toLowerCase();
      const bio = normalizeText(acc.profile?.bio || "").toLowerCase();
      const nationality = normalizeText(acc.profile?.nationality || "").toLowerCase();
      return name.includes(q) || profileName.includes(q) || bio.includes(q) || nationality.includes(q);
    });

    els.searchResultCount.textContent = String(results.length);

    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state empty-state-small";
      empty.textContent = "ظ…ط§ظپظٹط´ ظ†طھط§ط¦ط¬ ظ…ط·ط§ط¨ظ‚ط©.";
      els.userSearchResults.appendChild(empty);
      return;
    }

    results.forEach((acc) => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "search-result-item";

      const avatar = document.createElement("div");
      avatar.className = "avatar";
      setAvatar(avatar, acc, getAvatarInitial(acc));

      const info = document.createElement("div");
      info.className = "search-result-info";

      const titleLine = document.createElement("div");
      titleLine.className = "search-result-title-line";

      const name = document.createElement("strong");
      name.textContent = getDisplayName(acc);

      const badge = document.createElement("span");
      badge.className = "search-result-badge";
      badge.textContent = acc.id === getCurrentAccount()?.id ? "ط£ظ†طھ" : "ظپطھط­ ط§ظ„ظ…ظ„ظپ";

      titleLine.appendChild(name);
      titleLine.appendChild(badge);

      const sub = document.createElement("span");
      sub.textContent = acc.profile?.bio ? acc.profile.bio : "ظ…ظ„ظپ ط´ط®طµظٹ";

      info.appendChild(titleLine);
      info.appendChild(sub);
      item.appendChild(avatar);
      item.appendChild(info);
      item.addEventListener("click", () => openAccountProfileById(acc.id));

      els.userSearchResults.appendChild(item);
    });
  }

  function renderAll() {
    renderShellState();
    renderHomeView();
    renderProfileView();
    renderPrivateChatsList();
    renderPrivateConversation();
    renderUserView();
    renderMonitorPanel();
    renderUserSearchResults();
  }

  function handleProfileSave(event) {
    event.preventDefault();

    const current = getCurrentAccount();
    if (!current) {
      showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
      return;
    }

    const newName = clampText(els.profileName?.value || "", CONFIG.MAX_NAME_LENGTH);
    const newPass = normalizeText(els.profilePassword?.value || "");
    const newAge = normalizeText(els.profileAge?.value || "");
    const newGender = normalizeText(els.profileGender?.value || "");
    const newNationality = normalizeText(els.profileNationality?.value || "");
    const newBio = normalizeText(els.profileBio?.value || "");

    if (!newName) {
      showToast("ط§ظ„ط§ط³ظ… ظ…ط·ظ„ظˆط¨.");
      return;
    }

    const existing = getAccountByUsername(newName);
    if (existing && existing.id !== current.id) {
      showToast("ط§ظ„ط§ط³ظ… ط¯ظ‡ ظ…ط³طھط®ط¯ظ… ط¨ط§ظ„ظپط¹ظ„.");
      return;
    }

    current.username = newName;
    current.password = newPass;
    current.profile.name = newName;
    current.profile.age = newAge;
    current.profile.gender = newGender;
    current.profile.nationality = newNationality;
    current.profile.bio = newBio;
    current.lastSeenAt = now();

    if (current.id === state.currentAccountId) {
      current.sessionStartedAt = current.sessionStartedAt || now();
      current.sessionExpiresAt = current.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS);
    }

    writeStorage();
    renderAll();
    showToast("طھظ… ط­ظپط¸ ط§ظ„ظ…ظ„ظپ.");
  }

  function handleProfileImagePick(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      showToast("ط§ظ„طµظˆط±ط© ظƒط¨ظٹط±ط© ط¬ط¯ظ‹ط§. ط§ط®طھط§ط± طµظˆط±ط© ط£ط®ظپ.");
      event.target.value = "";
      return;
    }

    const current = getCurrentAccount();
    if (!current) {
      showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      current.profile.avatar = String(reader.result || "");
      writeStorage();
      renderProfileView();
      renderShellState();
      showToast("طھظ… طھط­ط¯ظٹط« ط§ظ„طµظˆط±ط©.");
    };
    reader.readAsDataURL(file);
  }

  function handlePublicSubmit(event) {
    event.preventDefault();
    const text = normalizeText(els.publicMessageInput?.value || "");
    if (!text) {
      showToast("ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط£ظˆظ„ط§ظ‹.");
      return;
    }

    if (!canUseCurrentSession()) {
      showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
      return;
    }

    sendPublicMessage(text);
    if (els.publicMessageInput) els.publicMessageInput.value = "";
    markActivity();
  }

  function handlePrivateSubmit(event) {
    event.preventDefault();
    const text = normalizeText(els.privateMessageInput?.value || "");
    const peerId = state.selectedPrivatePeerId;

    if (!peerId) {
      showToast("ط§ط®طھط± ط´ط®طµ ط£ظˆظ„ط§ظ‹.");
      return;
    }

    if (!text) {
      showToast("ط§ظƒطھط¨ ط±ط³ط§ظ„ط© ط£ظˆظ„ط§ظ‹.");
      return;
    }

    if (!canUseCurrentSession()) {
      showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
      return;
    }

    sendPrivateMessage(peerId, text);
    if (els.privateMessageInput) els.privateMessageInput.value = "";
    markActivity();
  }

  function handleAppTitleClick() {
    location.reload();
  }

  function handlePrivateShortcutClick() {
    openPrivateChat(state.selectedPrivatePeerId || getPrivateChatsForCurrentUser()[0]?.peerId || null, true);
  }

  /* =========================
     âڑ، EVENTS SYSTEM
  ========================= */

  function attachEvents() {
    if (els.menuBtn) {
      els.menuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (!els.menuDrawer) return;
        els.menuDrawer.classList.toggle("is-hidden");
        els.menuDrawer.setAttribute(
          "aria-hidden",
          els.menuDrawer.classList.contains("is-hidden") ? "true" : "false"
        );
      });
    }

    if (!window.__drawerClickAttached) {
  window.__drawerClickAttached = true;

  document.addEventListener("click", (event) => {
    const drawer = els.menuDrawer;
    const menuBtn = els.menuBtn;

    if (!drawer || !menuBtn) return;
    if (drawer.classList.contains("is-hidden")) return;

    const target = event.target;
    if (!(target instanceof Node)) return;

    const insideDrawer = drawer.contains(target);
    const insideMenuBtn = menuBtn.contains(target);

    // اقفل الدروار لو الضغط خارج الدروار والزرار
    if (!insideDrawer && !insideMenuBtn) {
      drawer.classList.add("is-hidden");
      drawer.setAttribute("aria-hidden", "true");
    }
  });
}

    els.appTitleBtn?.addEventListener("click", handleAppTitleClick);
    els.privateShortcutBtn?.addEventListener("click", handlePrivateShortcutClick);

    els.publicMessageForm?.addEventListener("submit", handlePublicSubmit);
    els.privateMessageForm?.addEventListener("submit", handlePrivateSubmit);
    els.profileForm?.addEventListener("submit", handleProfileSave);
    els.profileImageInput?.addEventListener("change", handleProfileImagePick);

    els.openMyProfileFromMenu?.addEventListener("click", openProfile);
    els.drawerProfileBtn?.addEventListener("click", openProfile);
    els.drawerMonitorBtn?.addEventListener("click", openMonitorPanel);
    els.profileMonitorBtn?.addEventListener("click", openMonitorPanel);

    els.drawerSettingsBtn?.addEventListener("click", () => {
      showToast("ط§ظ„ط¥ط¹ط¯ط§ط¯ط§طھ ظ‡طھطھط¶ط§ظپ ظ„ط§ط­ظ‚ظ‹ط§.");
    });

    els.drawerLogoutBtn?.addEventListener("click", () => {
      if (!getCurrentAccount()) {
        showToast("ظ„ط§ ظٹظˆط¬ط¯ ط­ط³ط§ط¨ ظ†ط´ط·.");
        return;
      }
      logoutCurrentAccount(true);
    });

    els.backFromProfileBtn?.addEventListener("click", () => openHome());
    els.closeProfileBtn?.addEventListener("click", () => openHome());
    els.backFromPrivateBtn?.addEventListener("click", () => openHome());
    els.backFromUserViewBtn?.addEventListener("click", () => openHome());
    els.closeUserViewBtn?.addEventListener("click", () => openHome());

    els.startPrivateChatBtn?.addEventListener("click", () => {
      const targetId = els.startPrivateChatBtn?.dataset?.targetId;
      if (!targetId) return;
      openPrivateChat(targetId, true);
    });

    els.userSearchInput?.addEventListener("input", () => {
      renderUserSearchResults();
    });

    els.publicMessageInput?.addEventListener("focus", () => markActivity());
    els.privateMessageInput?.addEventListener("focus", () => markActivity());

    const activityEvents = ["pointerdown", "keydown", "touchstart", "scroll", "mousemove"];
    activityEvents.forEach((type) => {
      document.addEventListener(
        type,
        () => {
          if (canUseCurrentSession()) markActivity();
        },
        { passive: true }
      );
    });

    window.addEventListener("storage", () => {
      readStorage();
      ensureCurrentAccount();
      renderAll();
    });
  }

  function createMonitorPanel() {
    if (!els.menuDrawer) return;

    const panel = document.createElement("section");
    panel.className = "drawer-section monitor-panel";
    panel.id = "monitorPanel";
    panel.innerHTML = `
      <div class="drawer-subhead">
        <h3 data-monitor-title>ظ…ظ†ط¸ط§ط± ظ…ظ„ظپظƒ</h3>
        <span class="tiny-count" data-monitor-count>0</span>
      </div>
      <div class="monitor-panel-body">
        <div class="empty-state empty-state-small" data-monitor-empty>ط³ط¬ظ‘ظ„ ط¯ط®ظˆظ„ظƒ ط¹ط´ط§ظ† ظٹط¸ظ‡ط± ط³ط¬ظ„ ط§ظ„ط²ظٹط§ط±ط§طھ.</div>
        <div class="monitor-list" data-monitor-list></div>
      </div>
    `;

    const firstSection = els.menuDrawer.querySelector(".drawer-section");
    if (firstSection && firstSection.parentElement === els.menuDrawer) {
      els.menuDrawer.insertBefore(panel, firstSection);
    } else {
      els.menuDrawer.appendChild(panel);
    }

    state.monitorPanelEl = panel;
  }

  function setupIntervals() {
    if (state.intervalTimer) clearInterval(state.intervalTimer);

    state.intervalTimer = setInterval(() => {
      const session = getCurrentSession();
      const acc = getCurrentAccount();

      if (session && acc) {
        if (isSessionExpired(session)) {
          commitCurrentSession(true);
          showToast("ط§ظ†طھظ‡طھ ط§ظ„ط¬ظ„ط³ط© ط¨ط¹ط¯ 24 ط³ط§ط¹ط©.");
          renderAll();
          return;
        }

        if (now() - Number(acc.lastSeenAt || 0) > CONFIG.ONLINE_WINDOW_MS) {
          renderShellState();
          renderOnlineUsers();
          renderFeaturedUsers();
          renderMonitorPanel();
        }
      }

      prunePublicMessages();
      prunePrivateThreads();
      writeStorage();
      renderShellState();
      renderOnlineUsers();
      renderFeaturedUsers();
      renderPrivateChatsList();
      renderPrivateConversation();
      renderMonitorPanel();
    }, 30000);
  }

  function tryBindExternalDB() {
    const db = window.KAREEM3_DB;
    if (!db || typeof db.init !== "function") return Promise.resolve(null);

    state.externalDB = db;
    return db
      .init({ mode: "auto" })
      .then(() => db.getStatus?.() || null)
      .catch((err) => {
        console.warn("[KAREEM3] ظپط´ظ„ طھظ‡ظٹط¦ط© ظ‚ط§ط¹ط¯ط© ط§ظ„ط¨ظٹط§ظ†ط§طھ ط§ظ„ط®ط§ط±ط¬ظٹط©طŒ ط¬ط§ط±ظچ ظ…طھط§ط¨ط¹ط© ط§ظ„ظˆط¶ط¹ ط§ظ„ظ…ط­ظ„ظٹ", err);
        return null;
      });
  }

  function initLocalData() {
    readStorage();
    const guest = ensureCurrentAccount();

    if (!Array.isArray(state.publicMessages) || !state.publicMessages.length) {
      state.publicMessages = [
        {
          id: createId("msg"),
          senderId: guest.id,
          senderLabel: getDisplayName(guest),
          text: "ط£ظ‡ظ„ط§ظ‹ ط¨ظƒ ظپظٹ ط´ط§طھ ظ†ط§ط±. ط¬ط±ظ‘ط¨ ط§ظƒطھط¨ ط±ط³ط§ظ„ط©.",
          at: now() - 5 * 60 * 1000,
        },
      ];
    }

    prunePublicMessages();
    prunePrivateThreads();
    writeStorage();
  }

  /* =========================
     ًں§  APP CORE
  ========================= */

  async function init() {
    cacheElements();
    createMonitorPanel();
    initLocalData();
    attachEvents();
    setupIntervals();
    renderAll();
    openHome();
    await tryBindExternalDB();
    if (canUseCurrentSession()) markActivity();
  }

  function cacheElements() {
    els.app = $("app");
    els.privateShortcutBtn = $("privateShortcutBtn");
    els.appTitleBtn = $("appTitleBtn");
    els.menuBtn = $("menuBtn");
    els.currentUserState = $("currentUserState");
    els.profileMonitorBtn = $("profileMonitorBtn");
    els.profileMonitorCount = $("profileMonitorCount");

    els.homeView = $("homeView");
    els.onlineUsersEmpty = $("onlineUsersEmpty");
    els.onlineUsersList = $("onlineUsersList");
    els.featuredUsersEmpty = $("featuredUsersEmpty");
    els.featuredUsersList = $("featuredUsersList");
    els.publicMessages = $("publicMessages");
    els.publicMessageForm = $("publicMessageForm");
    els.publicMessageInput = $("publicMessageInput");
    els.publicSendBtn = $("publicSendBtn");

    els.menuDrawer = $("menuDrawer");
    els.openMyProfileFromMenu = $("openMyProfileFromMenu");
    els.menuAvatar = $("menuAvatar");
    els.menuUserName = $("menuUserName");
    els.menuUserMeta = $("menuUserMeta");
    els.userSearchInput = $("userSearchInput");
    els.searchResultCount = $("searchResultCount");
    els.userSearchResults = $("userSearchResults");
    els.drawerProfileBtn = $("drawerProfileBtn");
    els.drawerMonitorBtn = $("drawerMonitorBtn");
    els.drawerSettingsBtn = $("drawerSettingsBtn");
    els.drawerLogoutBtn = $("drawerLogoutBtn");
    els.drawerMonitorBadge = $("drawerMonitorBadge");

    els.profileView = $("profileView");
    els.backFromProfileBtn = $("backFromProfileBtn");
    els.profileTitle = $("profileTitle");
    els.profileForm = $("profileForm");
    els.profileAvatarPreview = $("profileAvatarPreview");
    els.profileImageInput = $("profileImageInput");
    els.profileOnlineState = $("profileOnlineState");
    els.profileLastSeen = $("profileLastSeen");
    els.profileName = $("profileName");
    els.profilePassword = $("profilePassword");
    els.profileAge = $("profileAge");
    els.profileGender = $("profileGender");
    els.profileNationality = $("profileNationality");
    els.profileBio = $("profileBio");
    els.saveProfileBtn = $("saveProfileBtn");
    els.closeProfileBtn = $("closeProfileBtn");

    els.privateView = $("privateView");
    els.backFromPrivateBtn = $("backFromPrivateBtn");
    els.privateTitle = $("privateTitle");
    els.privateChatsEmpty = $("privateChatsEmpty");
    els.privateChatsList = $("privateChatsList");
    els.privateChatAvatar = $("privateChatAvatar");
    els.privateChatTitle = $("privateChatTitle");
    els.privateChatMeta = $("privateChatMeta");
    els.privateMessages = $("privateMessages");
    els.privateMessageForm = $("privateMessageForm");
    els.privateMessageInput = $("privateMessageInput");
    els.privateSendBtn = $("privateSendBtn");

    els.userView = $("userView");
    els.backFromUserViewBtn = $("backFromUserViewBtn");
    els.userViewTitle = $("userViewTitle");
    els.userViewAvatar = $("userViewAvatar");
    els.userViewName = $("userViewName");
    els.userViewStatus = $("userViewStatus");
    els.userViewAge = $("userViewAge");
    els.userViewGender = $("userViewGender");
    els.userViewNationality = $("userViewNationality");
    els.userViewActivity = $("userViewActivity");
    els.userViewBio = $("userViewBio");
    els.startPrivateChatBtn = $("startPrivateChatBtn");
    els.closeUserViewBtn = $("closeUserViewBtn");
  }

  window.KAREEM3 = {
    refresh: renderAll,
    logout: logoutCurrentAccount,
    openProfile: openProfile,
    openUserProfileById,
    openPrivateChat,
    state: () => ({
      currentAccount: getCurrentAccount(),
      currentSession: getCurrentSession(),
      unreadNotifications: getUnreadNotificationCount(),
      view: state.view,
    }),
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
