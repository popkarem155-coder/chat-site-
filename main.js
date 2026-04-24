(() => {
  "use strict";

  const STORAGE_KEYS = {
    state: "kareem3_state_v2",
    session: "kareem3_session_v2",
    loggedOut: "kareem3_logged_out_v1",
  };

  const CONFIG = {
    PUBLIC_MESSAGE_CAP: 70,
    PRIVATE_MESSAGE_CAP: 70,
    MAX_NOTIFICATIONS: 70,
    SESSION_TTL_MS: 1000 * 60 * 60 * 12,
    TOAST_MS: 2200,
    DEMO_REPLY_DELAY_MS: 900,
    ONLINE_WINDOW_MS: 1000 * 60 * 60 * 2,
    FEATURED_WINDOW_MS: 1000 * 60 * 60 * 2,
    MAX_NAME_LENGTH: 40,
    MAX_BIO_LENGTH: 280,
  };

  const els = {};
  const state = {
    ready: false,
    view: "home",
    menuOpen: false,
    guestMode: false,
    currentAccountId: null,
    selectedUserId: null,
    selectedPrivatePeerId: null,
    searchQuery: "",
    privateSearchQuery: "",
    accounts: [],
    publicMessages: [],
    privateThreads: {},
    bridge: null,
    bridgeStatus: null,
    toastHostEl: null,
    activitySaveTimer: null,
    monitorPanelEl: null,
    pullRefresh: { tracking: false, startY: 0, startX: 0 },
  };

  const $ = (id) => document.getElementById(id);

  /* =========================
     UTILITIES
  ========================= */

  function now() {
    return Date.now();
  }

  function normalizeText(value) {
    return String(value ?? "").replace(/\s+/g, " ").trim();
  }

  function clampText(value, maxLen) {
    return normalizeText(value).slice(0, maxLen);
  }

  function createId(prefix = "id") {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
  }

  function hashString(str) {
    let hash = 0;
    const input = String(str || "");
    for (let i = 0; i < input.length; i += 1) {
      hash = (hash << 5) - hash + input.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  }

  function formatTime(ts) {
    const d = new Date(Number(ts || now()));
    return new Intl.DateTimeFormat("ar-EG", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  }

  function timeAgo(ts) {
    const diff = Math.max(0, now() - Number(ts || 0));
    const sec = Math.floor(diff / 1000);
    if (sec < 10) return "الآن";
    if (sec < 60) return `منذ ${sec} ث`;
    const min = Math.floor(sec / 60);
    if (min < 60) return `منذ ${min} د`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `منذ ${hr} س`;
    const day = Math.floor(hr / 24);
    return `منذ ${day} ي`;
  }

  function durationLabel(ms) {
    const totalMinutes = Math.floor(Math.max(0, Number(ms || 0)) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    if (!hours && !minutes) return "أقل من دقيقة";
    if (!hours) return `${minutes} دقيقة`;
    if (!minutes) return `${hours} ساعة`;
    return `${hours} س ${minutes} د`;
  }

  function getThreadKey(a, b) {
    return [String(a), String(b)].sort().join("__");
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  /* =========================
     NORMALIZERS
  ========================= */

  function normalizeMessage(message) {
    if (!message || typeof message !== "object") return null;
    return {
      id: String(message.id || createId("msg")),
      senderId: message.senderId == null ? null : String(message.senderId),
      senderLabel: clampText(message.senderLabel || "مستخدم", 50) || "مستخدم",
      text: clampText(message.text || "", 500),
      at: Number(message.at || now()),
    };
  }

  function normalizeAccount(acc) {
    if (!acc || typeof acc !== "object") return null;
    const profile = acc.profile && typeof acc.profile === "object" ? acc.profile : {};

    const cleaned = {
      id: String(acc.id || createId("acc")),
      username: clampText(acc.username || profile.name || "مستخدم", CONFIG.MAX_NAME_LENGTH) || "مستخدم",
      password: normalizeText(acc.password || ""),
      profile: {
        name: clampText(profile.name || acc.username || "مستخدم", CONFIG.MAX_NAME_LENGTH) || "مستخدم",
        age: normalizeText(profile.age || ""),
        gender: normalizeText(profile.gender || ""),
        nationality: clampText(profile.nationality || "", 40),
        bio: clampText(profile.bio || "", CONFIG.MAX_BIO_LENGTH),
        avatar: typeof profile.avatar === "string" ? profile.avatar : "",
      },
      lastSeenAt: Number(acc.lastSeenAt || 0),
      sessionStartedAt: acc.sessionStartedAt ? Number(acc.sessionStartedAt) : null,
      sessionExpiresAt: acc.sessionExpiresAt ? Number(acc.sessionExpiresAt) : null,
      totalActiveMs: Number(acc.totalActiveMs || 0),
      notifications: Array.isArray(acc.notifications) ? acc.notifications : [],
      isDemo: Boolean(acc.isDemo),
    };

    if (!cleaned.profile.name) cleaned.profile.name = cleaned.username || "مستخدم";
    return cleaned;
  }

  function normalizeThread(thread) {
    if (!thread || typeof thread !== "object") return null;
    return {
      participants: safeArray(thread.participants).map(String),
      messages: safeArray(thread.messages).map(normalizeMessage).filter(Boolean),
      updatedAt: Number(thread.updatedAt || 0),
    };
  }

  /* =========================
     STATE HELPERS
  ========================= */

  function getAccounts() {
    return Array.isArray(state.accounts) ? state.accounts : [];
  }

  function setAccounts(list) {
    state.accounts = safeArray(list).map(normalizeAccount).filter(Boolean);
  }

  function getAccountById(id) {
    if (!id) return null;
    return getAccounts().find((acc) => acc.id === String(id)) || null;
  }

  function getAccountByUsername(username) {
    const q = normalizeText(username).toLowerCase();
    if (!q) return null;
    return getAccounts().find((acc) => normalizeText(acc.username).toLowerCase() === q) || null;
  }

  function getCurrentAccount() {
    return getAccountById(state.currentAccountId);
  }

  function getDisplayName(acc) {
    if (!acc) return "مستخدم";
    return normalizeText(acc.profile?.name || acc.username || "مستخدم") || "مستخدم";
  }

  function getAvatarInitial(acc) {
    const name = getDisplayName(acc);
    return name ? name[0] : "؟";
  }

  function isSessionExpired(session) {
    if (!session) return true;
    const expiresAt = Number(session.expiresAt || 0);
    return expiresAt > 0 && now() > expiresAt;
  }

  function isAccountOnline(acc) {
    if (!acc) return false;
    const current = getCurrentAccount();
    if (current && current.id === acc.id) return true;
    return Boolean(acc.lastSeenAt && now() - Number(acc.lastSeenAt) < CONFIG.ONLINE_WINDOW_MS);
  }

  function isAccountFeatured(acc) {
    if (!acc) return false;
    return Number(acc.totalActiveMs || 0) >= CONFIG.FEATURED_WINDOW_MS;
  }

  function getActiveDurationForAccount(acc) {
    if (!acc) return 0;
    let total = Number(acc.totalActiveMs || 0);
    if (state.currentAccountId && state.currentAccountId === acc.id) {
      const session = getCurrentSession();
      if (session && session.accountId === acc.id && !isSessionExpired(session)) {
        total += Math.max(0, now() - Number(session.startedAt || now()));
      }
    }
    return total;
  }

  function getUnreadNotificationCount() {
    const current = getCurrentAccount();
    if (!current || !Array.isArray(current.notifications)) return 0;
    return current.notifications.filter((n) => !n.read).length;
  }

  function getMonitorItems() {
    const current = getCurrentAccount();
    if (!current || !Array.isArray(current.notifications)) return [];
    return [...current.notifications].sort((a, b) => Number(b.at) - Number(a.at));
  }

  /* =========================
     STORAGE
  ========================= */

  function getCurrentSession() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.session);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      return {
        accountId: String(parsed.accountId || ""),
        startedAt: Number(parsed.startedAt || 0),
        expiresAt: Number(parsed.expiresAt || 0),
      };
    } catch {
      return null;
    }
  }

  function saveCurrentSession(session) {
    try {
      localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
    } catch {}
  }

  function clearCurrentSession() {
    try {
      localStorage.removeItem(STORAGE_KEYS.session);
    } catch {}
  }

  function readStorage() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.state);
      if (!raw) return false;

      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object") return false;

      setAccounts(parsed.accounts || []);
      state.publicMessages = safeArray(parsed.publicMessages)
        .map(normalizeMessage)
        .filter(Boolean);

      state.privateThreads = {};
      if (parsed.privateThreads && typeof parsed.privateThreads === "object") {
        Object.entries(parsed.privateThreads).forEach(([key, thread]) => {
          const normalized = normalizeThread(thread);
          if (normalized) state.privateThreads[key] = normalized;
        });
      }

      state.currentAccountId = parsed.currentAccountId ? String(parsed.currentAccountId) : null;
      state.searchQuery = normalizeText(parsed.searchQuery || "");
      state.privateSearchQuery = normalizeText(parsed.privateSearchQuery || "");
      state.view = ["home", "profile", "private", "user"].includes(parsed.view) ? parsed.view : "home";
      state.selectedUserId = parsed.selectedUserId ? String(parsed.selectedUserId) : null;
      state.selectedPrivatePeerId = parsed.selectedPrivatePeerId ? String(parsed.selectedPrivatePeerId) : null;
      return true;
    } catch (err) {
      console.warn("Failed to read storage:", err);
      return false;
    }
  }

  function saveStorage() {
    prunePublicMessages();
    prunePrivateThreads();

    const payload = {
      accounts: getAccounts(),
      publicMessages: safeArray(state.publicMessages).slice(-CONFIG.PUBLIC_MESSAGE_CAP),
      privateThreads: state.privateThreads || {},
      currentAccountId: state.currentAccountId,
      searchQuery: state.searchQuery,
      privateSearchQuery: state.privateSearchQuery,
      view: state.view,
      selectedUserId: state.selectedUserId,
      selectedPrivatePeerId: state.selectedPrivatePeerId,
    };

    try {
      localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(payload));
    } catch (err) {
      console.warn("Failed to save storage:", err);
    }
  }

  function prunePublicMessages() {
    if (!Array.isArray(state.publicMessages)) state.publicMessages = [];
    if (state.publicMessages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      state.publicMessages = state.publicMessages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }
  }

  function prunePrivateThreads() {
    const cleaned = {};
    Object.entries(state.privateThreads || {}).forEach(([key, thread]) => {
      const normalized = normalizeThread(thread);
      if (!normalized) return;
      if (normalized.messages.length > CONFIG.PRIVATE_MESSAGE_CAP) {
        normalized.messages = normalized.messages.slice(-CONFIG.PRIVATE_MESSAGE_CAP);
      }
      cleaned[key] = normalized;
    });
    state.privateThreads = cleaned;
  }

  function ensureDemoAccounts() {
    if (getAccounts().length) return;

    setAccounts([
      {
        id: "demo_ahmed",
        username: "أحمد",
        password: "1234",
        profile: {
          name: "أحمد",
          age: "24",
          gender: "ذكر",
          nationality: "مصري",
          bio: "حساب تجريبي",
          avatar: "",
        },
        lastSeenAt: now(),
        totalActiveMs: 1000 * 60 * 42,
        notifications: [],
        isDemo: true,
      },
      {
        id: "demo_mona",
        username: "منى",
        password: "1234",
        profile: {
          name: "منى",
          age: "22",
          gender: "أنثى",
          nationality: "مصري",
          bio: "حساب تجريبي",
          avatar: "",
        },
        lastSeenAt: now() - 1000 * 60 * 18,
        totalActiveMs: 1000 * 60 * 128,
        notifications: [],
        isDemo: true,
      },
    ]);

    saveStorage();
  }

  function ensureWelcomePublicMessage() {
    if (Array.isArray(state.publicMessages) && state.publicMessages.length) return;
    state.publicMessages = [
      {
        id: createId("msg"),
        senderId: null,
        senderLabel: "شات نار",
        text: "أهلًا بك في شات نار. جرّب اكتب رسالة.",
        at: now() - 5 * 60 * 1000,
      },
    ];
  }

  function ensureCurrentAccount() {
    if (state.guestMode) {
      state.currentAccountId = null;
      return null;
    }

    const session = getCurrentSession();
    if (session && !isSessionExpired(session)) {
      const acc = getAccountById(session.accountId);
      if (acc) {
        state.currentAccountId = acc.id;
        return acc;
      }
    }

    const first = getAccounts()[0];
    if (first) {
      const startedAt = now();
      first.lastSeenAt = startedAt;
      first.sessionStartedAt = startedAt;
      first.sessionExpiresAt = startedAt + CONFIG.SESSION_TTL_MS;
      state.currentAccountId = first.id;
      saveCurrentSession({
        accountId: first.id,
        startedAt,
        expiresAt: first.sessionExpiresAt,
      });
      saveStorage();
      return first;
    }

    state.currentAccountId = null;
    return null;
  }

  function canUseCurrentSession() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();
    if (!acc || !session) return false;
    if (session.accountId !== acc.id) return false;
    if (isSessionExpired(session)) return false;
    return true;
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
    clearCurrentSession();
    state.currentAccountId = null;
    saveStorage();
  }

  function loginAccount(account) {
    if (!account) return;
    const startedAt = now();
    account.lastSeenAt = startedAt;
    account.sessionStartedAt = startedAt;
    account.sessionExpiresAt = startedAt + CONFIG.SESSION_TTL_MS;
    state.currentAccountId = account.id;
    state.guestMode = false;
    saveCurrentSession({
      accountId: account.id,
      startedAt,
      expiresAt: account.sessionExpiresAt,
    });
    saveStorage();
    renderAll();
    setBridgeUser();
  }

  function logoutCurrentAccount(showMessage = true) {
    commitCurrentSession(true);
    state.guestMode = true;
    state.currentAccountId = null;
    state.selectedUserId = null;
    state.selectedPrivatePeerId = null;
    clearCurrentSession();
    saveStorage();
    renderAll();
    setBridgeUser();
    if (showMessage) showToast("تم تسجيل الخروج مؤقتًا. أعد تحميل الصفحة للرجوع.");
  }

  function ensureThread(a, b, createIfMissing = false) {
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
     TOASTS / AVATAR
  ========================= */

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

    requestAnimationFrame(() => toast.classList.add("is-visible"));

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, CONFIG.TOAST_MS);
  }

  function setAvatar(el, acc, fallback = "؟") {
    if (!el) return;
    const avatar = acc?.profile?.avatar;
    if (avatar) {
      el.style.backgroundImage = `url("${avatar}")`;
      el.textContent = "";
    } else {
      el.style.backgroundImage = "";
      el.textContent = fallback || getAvatarInitial(acc);
    }
  }

  function focusInput(input) {
    if (!input) return;
    window.requestAnimationFrame(() => {
      try {
        input.focus({ preventScroll: true });
      } catch {
        input.focus();
      }
      const len = input.value?.length ?? 0;
      try {
        input.setSelectionRange(len, len);
      } catch {}
    });
  }

  /* =========================
     PUBLIC / PRIVATE MESSAGES
  ========================= */

  function addPublicMessage(text, senderId = null, senderLabel = "مستخدم") {
    const message = {
      id: createId("msg"),
      senderId,
      senderLabel: senderLabel || "مستخدم",
      text: normalizeText(text),
      at: now(),
    };

    state.publicMessages.push(message);
    prunePublicMessages();
    saveStorage();
    renderPublicMessages();
    renderShellState();
    return message;
  }

  function addPrivateMessage(peerId, text, senderId = null, senderLabel = "مستخدم") {
    const current = getCurrentAccount();
    if (!current || !peerId) return null;

    const thread = ensureThread(current.id, peerId, true);
    if (!thread) return null;

    const message = {
      id: createId("pmsg"),
      senderId,
      senderLabel: senderLabel || "مستخدم",
      text: normalizeText(text),
      at: now(),
    };

    thread.messages = Array.isArray(thread.messages) ? thread.messages : [];
    thread.messages.push(message);

    if (thread.messages.length > CONFIG.PRIVATE_MESSAGE_CAP) {
      thread.messages = thread.messages.slice(-CONFIG.PRIVATE_MESSAGE_CAP);
    }

    thread.updatedAt = now();
    state.privateThreads[getThreadKey(current.id, peerId)] = thread;
    prunePrivateThreads();
    saveStorage();
    renderPrivateDrawerChatsList();
    renderPrivateConversation();
    renderShellState();
    return message;
  }

  function scheduleDemoReply(peerId, originalText) {
    const peer = getAccountById(peerId);
    if (!peer || !peer.isDemo) return;

    const replies = [
      "وصلت الرسالة 👍",
      "تمام، جرّب حاجة تانية.",
      "أنا موجود، كمل.",
      "ممتاز، شغال.",
    ];

    window.setTimeout(() => {
      const reply = replies[hashString(originalText + peer.id) % replies.length];
      addPrivateMessage(peerId, reply, peer.id, getDisplayName(peer));
    }, CONFIG.DEMO_REPLY_DELAY_MS);
  }

  function getPrivateChatMatches(query = state.privateSearchQuery) {
    const current = getCurrentAccount();
    if (!current) return [];

    const q = normalizeText(query || "").toLowerCase();
    const chats = getPrivateChatsForCurrentUser();

    if (!q) return chats;

    return chats.filter((item) => {
      const peer = item.peer;
      const peerName = normalizeText(peer?.username || "").toLowerCase();
      const profileName = normalizeText(peer?.profile?.name || "").toLowerCase();
      const bio = normalizeText(peer?.profile?.bio || "").toLowerCase();
      const nationality = normalizeText(peer?.profile?.nationality || "").toLowerCase();
      const lastMessage = normalizeText(item.lastMessage?.text || "").toLowerCase();

      return (
        peerName.includes(q) ||
        profileName.includes(q) ||
        bio.includes(q) ||
        nationality.includes(q) ||
        lastMessage.includes(q)
      );
    });
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
        const lastMessage = Array.isArray(t.messages) && t.messages.length ? t.messages[t.messages.length - 1] : null;

        return {
          key,
          thread: t,
          peerId,
          peer,
          lastMessage,
          updatedAt: Number(t.updatedAt || lastMessage?.at || 0),
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }

  function getThreadMessagesForPeer(peerId) {
    const current = getCurrentAccount();
    if (!current || !peerId) return [];
    const thread = ensureThread(current.id, peerId, false);
    return Array.isArray(thread?.messages) ? thread.messages : [];
  }

  /* =========================
     RENDERERS
  ========================= */

  function renderShellState() {
    const current = getCurrentAccount();

    if (els.currentUserState) {
      if (!current) els.currentUserState.textContent = "زائر";
      else if (isAccountFeatured(current)) els.currentUserState.textContent = `${getDisplayName(current)} • مستخدم مميز`;
      else if (isAccountOnline(current)) els.currentUserState.textContent = `${getDisplayName(current)} • متصل الآن`;
      else els.currentUserState.textContent = `${getDisplayName(current)} • غير نشط`;
    }

    if (els.menuUserName) {
      els.menuUserName.textContent = current ? getDisplayName(current) : "ملفي الشخصي";
    }

    if (els.menuUserMeta) {
      els.menuUserMeta.textContent = current
        ? `اضغط لفتح ملفك وتعديل البيانات • ${isAccountFeatured(current) ? "مستخدم مميز" : "حساب عادي"}`
        : "سيظهر ملفك بعد تفعيل الحساب";
    }

    if (els.menuAvatar) {
      setAvatar(els.menuAvatar, current, current ? getAvatarInitial(current) : "ز");
    }

    if (els.drawerMonitorBadge) {
      els.drawerMonitorBadge.textContent = String(getUnreadNotificationCount());
    }

    if (els.searchResultCount) {
      els.searchResultCount.textContent = String(renderUserSearchResultsCount());
    }

    if (els.publicMessageInput) {
      els.publicMessageInput.placeholder = current ? "اكتب رسالتك..." : "لا يوجد حساب نشط";
    }

    if (els.privateSendBtn) {
      els.privateSendBtn.textContent = "إرسال";
    }
  }

  function renderPublicMessages() {
    if (!els.publicMessages) return;
    els.publicMessages.innerHTML = "";

    const messages = safeArray(state.publicMessages);
    if (!messages.length) {
      const empty = document.createElement("div");
      empty.className = "messages-placeholder";
      empty.textContent = "لسه ما فيش رسائل ظاهرة هنا.";
      els.publicMessages.appendChild(empty);
      return;
    }

    messages.forEach((message) => {
      els.publicMessages.appendChild(buildMessageElement(message));
    });

    els.publicMessages.scrollTop = els.publicMessages.scrollHeight;
  }

  function buildMessageElement(message) {
    const sender = getAccountById(message.senderId);
    const senderName = normalizeText(sender ? getDisplayName(sender) : message.senderLabel || "مستخدم");

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
    setAvatar(avatar, sender, senderName ? senderName[0] : "؟");
    avatar.title = `فتح ملف ${senderName}`;
    if (message.senderId) {
      avatar.addEventListener("click", () => openUserProfileById(message.senderId));
    }

    const metaWrap = document.createElement("div");
    metaWrap.className = "message-meta-wrap";

    const senderBtn = document.createElement("button");
    senderBtn.type = "button";
    senderBtn.className = "message-sender";
    senderBtn.textContent = senderName;
    if (message.senderId) {
      senderBtn.addEventListener("click", () => openUserProfileById(message.senderId));
    }

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

  function renderOnlineUsers() {
    if (!els.onlineUsersList || !els.onlineUsersEmpty) return;

    const onlineUsers = getAccounts()
      .filter((acc) => isAccountOnline(acc))
      .sort((a, b) => {
        if (a.id === state.currentAccountId) return -1;
        if (b.id === state.currentAccountId) return 1;
        return Number(b.lastSeenAt || 0) - Number(a.lastSeenAt || 0);
      });

    els.onlineUsersList.innerHTML = "";

    if (!onlineUsers.length) {
      els.onlineUsersEmpty.classList.remove("is-hidden");
      return;
    }

    els.onlineUsersEmpty.classList.add("is-hidden");

    onlineUsers.forEach((acc) => {
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
      sub.textContent = acc.id === state.currentAccountId ? "أنت الآن" : "متصل الآن";

      info.appendChild(name);
      info.appendChild(sub);

      const badge = document.createElement("span");
      badge.className = "online-badge";
      badge.textContent = "●";

      row.appendChild(avatar);
      row.appendChild(info);
      row.appendChild(badge);
      row.addEventListener("click", () => openUserProfileById(acc.id));

      els.onlineUsersList.appendChild(row);
    });
  }

  function renderFeaturedUsers() {
    if (!els.featuredUsersList || !els.featuredUsersEmpty) return;

    const featuredUsers = getAccounts()
      .filter((acc) => isAccountFeatured(acc))
      .sort((a, b) => Number(b.lastSeenAt || 0) - Number(a.lastSeenAt || 0));

    els.featuredUsersList.innerHTML = "";

    if (!featuredUsers.length) {
      els.featuredUsersEmpty.classList.remove("is-hidden");
      return;
    }

    els.featuredUsersEmpty.classList.add("is-hidden");

    featuredUsers.forEach((acc) => {
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
      star.textContent = "★";

      nameLine.appendChild(name);
      nameLine.appendChild(star);

      const sub = document.createElement("span");
      sub.textContent = durationLabel(getActiveDurationForAccount(acc));

      info.appendChild(nameLine);
      info.appendChild(sub);

      row.appendChild(avatar);
      row.appendChild(info);
      row.addEventListener("click", () => openUserProfileById(acc.id));

      els.featuredUsersList.appendChild(row);
    });
  }

  function renderUserSearchResultsCount() {
    const query = normalizeText(els.userSearchInputHome?.value || els.userSearchInputDrawer?.value || state.searchQuery || "");
    if (!query) return 0;

    const q = query.toLowerCase();
    return getAccounts().filter((acc) => {
      const name = normalizeText(acc.username).toLowerCase();
      const profileName = normalizeText(acc.profile?.name || "").toLowerCase();
      const bio = normalizeText(acc.profile?.bio || "").toLowerCase();
      const nationality = normalizeText(acc.profile?.nationality || "").toLowerCase();
      return name.includes(q) || profileName.includes(q) || bio.includes(q) || nationality.includes(q);
    }).length;
  }

  function renderUserSearchResults() {
    if (!els.userSearchResults || !els.searchResultCount) return;

    const query = normalizeText(els.userSearchInputHome?.value || els.userSearchInputDrawer?.value || "");
    state.searchQuery = query;

    if (els.userSearchInputHome && els.userSearchInputHome.value !== query) els.userSearchInputHome.value = query;
    if (els.userSearchInputDrawer && els.userSearchInputDrawer.value !== query) els.userSearchInputDrawer.value = query;

    els.userSearchResults.innerHTML = "";
    const count = renderUserSearchResultsCount();
    els.searchResultCount.textContent = String(count);

    if (!query) {
      const empty = document.createElement("div");
      empty.className = "empty-state empty-state-small";
      empty.textContent = "اكتب اسم المستخدم عشان يظهر في النتائج.";
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

    if (!results.length) {
      const empty = document.createElement("div");
      empty.className = "empty-state empty-state-small";
      empty.textContent = "مافيش نتائج مطابقة.";
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
      badge.textContent = acc.id === getCurrentAccount()?.id ? "أنت" : "فتح الملف";

      titleLine.appendChild(name);
      titleLine.appendChild(badge);

      const sub = document.createElement("span");
      sub.textContent = acc.profile?.bio ? acc.profile.bio : "ملف شخصي";

      info.appendChild(titleLine);
      info.appendChild(sub);
      item.appendChild(avatar);
      item.appendChild(info);
      item.addEventListener("click", () => openUserProfileById(acc.id));

      els.userSearchResults.appendChild(item);
    });
  }

  function renderPrivateDrawerChatsList() {
    if (!els.privateChatsList || !els.privateChatsEmpty) return;

    const current = getCurrentAccount();
    const chats = getPrivateChatMatches(state.privateSearchQuery);

    els.privateChatsList.innerHTML = "";

    if (!current) {
      els.privateChatsEmpty.classList.remove("is-hidden");
      els.privateChatsEmpty.textContent = "لا يوجد حساب نشط حاليًا.";
      if (els.privateChatsCount) els.privateChatsCount.textContent = "0";
      return;
    }

    if (!chats.length) {
      els.privateChatsEmpty.classList.remove("is-hidden");
      els.privateChatsEmpty.textContent = state.privateSearchQuery ? "مافيش محادثات مطابقة." : "لسه ما كلمتش حد في الخاص.";
      if (els.privateChatsCount) els.privateChatsCount.textContent = "0";
      return;
    }

    els.privateChatsEmpty.classList.add("is-hidden");
    if (els.privateChatsCount) els.privateChatsCount.textContent = String(chats.length);

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
      setAvatar(avatar, peer, peer ? getAvatarInitial(peer) : "؟");

      const info = document.createElement("div");
      info.className = "private-chat-item-info";

      const name = document.createElement("strong");
      name.textContent = peer ? getDisplayName(peer) : "مستخدم غير معروف";

      const preview = document.createElement("span");
      const lastMessage = item.lastMessage;
      preview.textContent = lastMessage
        ? (lastMessage.senderId === current.id ? "أنت: " : "") + (lastMessage.text || "")
        : "ابدأ المحادثة";

      info.appendChild(name);
      info.appendChild(preview);

      const time = document.createElement("time");
      time.className = "private-chat-item-time";
      time.textContent = lastMessage ? formatTime(lastMessage.at) : "";

      btn.appendChild(avatar);
      btn.appendChild(info);
      btn.appendChild(time);
      btn.addEventListener("click", () => {
        if (item.peerId) openPrivateChat(item.peerId);
      });

      els.privateChatsList.appendChild(btn);
    });
  }

  function renderPrivateConversation() {
    if (!els.privateMessages || !els.privateChatTitle || !els.privateChatMeta || !els.privateChatAvatar) return;

    const current = getCurrentAccount();
    const peer = getAccountById(state.selectedPrivatePeerId);

    if (!current) {
      els.privateChatTitle.textContent = "لا توجد محادثة";
      els.privateChatMeta.textContent = "لا يوجد حساب نشط.";
      setAvatar(els.privateChatAvatar, null, "؟");
      els.privateMessages.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "لا يوجد حساب نشط حاليًا.";
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = "لا يوجد حساب نشط";
      if (els.privateSendBtn) els.privateSendBtn.disabled = true;
      return;
    }

    if (!peer) {
      els.privateChatTitle.textContent = "اختار شخص من القائمة";
      els.privateChatMeta.textContent = "هنا هتظهر المحادثة كاملة.";
      setAvatar(els.privateChatAvatar, null, "؟");
      els.privateMessages.innerHTML = "";
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "اختار شخص من القائمة أو من البحث.";
      els.privateMessages.appendChild(placeholder);
      if (els.privateMessageInput) els.privateMessageInput.placeholder = "اكتب رسالتك الخاصة...";
      if (els.privateSendBtn) els.privateSendBtn.disabled = true;
      return;
    }

    els.privateChatTitle.textContent = getDisplayName(peer);
    if (isAccountOnline(peer)) {
      els.privateChatMeta.textContent = "متصل الآن";
    } else if (peer.lastSeenAt) {
      els.privateChatMeta.textContent = `آخر ظهور ${timeAgo(peer.lastSeenAt)}`;
    } else {
      els.privateChatMeta.textContent = "مستخدم جديد";
    }

    setAvatar(els.privateChatAvatar, peer, getAvatarInitial(peer));
    if (els.privateSendBtn) els.privateSendBtn.disabled = false;
    if (els.privateMessageInput) {
      els.privateMessageInput.placeholder = `اكتب رسالة إلى ${getDisplayName(peer)}...`;
    }

    const messages = getThreadMessagesForPeer(peer.id);
    els.privateMessages.innerHTML = "";

    if (!messages.length) {
      const placeholder = document.createElement("div");
      placeholder.className = "messages-placeholder";
      placeholder.textContent = "ما فيش رسائل لسه. ابدأ أول رسالة.";
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
      if (els.userViewTitle) els.userViewTitle.textContent = "ملف المستخدم";
      if (els.userViewName) els.userViewName.textContent = "اسم المستخدم";
      if (els.userViewStatus) els.userViewStatus.textContent = "المستخدم غير موجود";
      if (els.userViewAge) els.userViewAge.textContent = "—";
      if (els.userViewGender) els.userViewGender.textContent = "—";
      if (els.userViewNationality) els.userViewNationality.textContent = "—";
      if (els.userViewActivity) els.userViewActivity.textContent = "—";
      if (els.userViewBio) els.userViewBio.textContent = "لا توجد بيانات.";
      setAvatar(els.userViewAvatar, null, "؟");
      return;
    }

    if (els.userViewTitle) els.userViewTitle.textContent = `ملف ${getDisplayName(target)}`;
    if (els.userViewName) els.userViewName.textContent = getDisplayName(target);
    if (els.userViewAge) els.userViewAge.textContent = target.profile?.age || "—";
    if (els.userViewGender) els.userViewGender.textContent = target.profile?.gender || "—";
    if (els.userViewNationality) els.userViewNationality.textContent = target.profile?.nationality || "—";
    if (els.userViewBio) els.userViewBio.textContent = target.profile?.bio || "لا توجد نبذة بعد.";

    if (els.userViewStatus) {
      if (isAccountOnline(target)) {
        els.userViewStatus.textContent = "متصل الآن";
      } else if (target.lastSeenAt) {
        els.userViewStatus.textContent = `آخر ظهور ${timeAgo(target.lastSeenAt)}`;
      } else {
        els.userViewStatus.textContent = "غير محدد";
      }
    }

    if (els.userViewActivity) {
      els.userViewActivity.textContent = durationLabel(getActiveDurationForAccount(target));
    }

    setAvatar(els.userViewAvatar, target, getAvatarInitial(target));

    if (els.startPrivateChatBtn) {
      els.startPrivateChatBtn.dataset.targetId = target.id;
      els.startPrivateChatBtn.textContent = "فتح شات خاص";
    }
  }

  function renderMonitorPanel() {
    if (!state.monitorPanelEl) return;

    const current = getCurrentAccount();
    const unreadCount = getUnreadNotificationCount();

    const titleEl = state.monitorPanelEl.querySelector("[data-monitor-title]");
    const countEl = state.monitorPanelEl.querySelector("[data-monitor-count]");
    const listEl = state.monitorPanelEl.querySelector("[data-monitor-list]");
    const emptyEl = state.monitorPanelEl.querySelector("[data-monitor-empty]");

    if (!titleEl || !countEl || !listEl || !emptyEl) return;

    listEl.innerHTML = "";
    countEl.textContent = String(unreadCount);

    if (!current) {
      titleEl.textContent = "منظار ملفك";
      emptyEl.textContent = "لا يوجد حساب نشط.";
      emptyEl.classList.remove("is-hidden");
      return;
    }

    titleEl.textContent = "منظار ملفك";
    const items = getMonitorItems();

    if (!items.length) {
      emptyEl.textContent = "لا توجد زيارات لملفك لسه.";
      emptyEl.classList.remove("is-hidden");
      return;
    }

    emptyEl.classList.add("is-hidden");

    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "monitor-item";

      const icon = document.createElement("div");
      icon.className = "monitor-item-icon";
      icon.textContent = "👀";

      const info = document.createElement("div");
      info.className = "monitor-item-info";

      const title = document.createElement("strong");
      title.textContent = item.viewerLabel || "زائر";

      const sub = document.createElement("span");
      sub.textContent = `${timeAgo(item.at)} • زار ملفك`;

      info.appendChild(title);
      info.appendChild(sub);
      row.appendChild(icon);
      row.appendChild(info);
      listEl.appendChild(row);
    });
  }

  function renderHomeView() {
    renderShellState();
    renderPublicMessages();
    renderOnlineUsers();
    renderFeaturedUsers();
    renderUserSearchResults();
    renderPrivateDrawerChatsList();
    renderMonitorPanel();
  }

  function renderProfileView() {
    const current = getCurrentAccount();
    if (!current) return;

    if (els.profileTitle) els.profileTitle.textContent = "ملفي الشخصي";
    if (els.profileName) els.profileName.value = current.username || "";
    if (els.profilePassword) els.profilePassword.value = current.password || "";
    if (els.profileAge) els.profileAge.value = current.profile?.age || "";
    if (els.profileGender) els.profileGender.value = current.profile?.gender || "";
    if (els.profileNationality) els.profileNationality.value = current.profile?.nationality || "";
    if (els.profileBio) els.profileBio.value = current.profile?.bio || "";

    if (els.profileAvatarPreview) setAvatar(els.profileAvatarPreview, current, getAvatarInitial(current));
    if (els.profileOnlineState) {
      els.profileOnlineState.textContent = isAccountOnline(current) ? "متصل الآن" : "غير نشط";
    }

    if (els.profileLastSeen) {
      els.profileLastSeen.textContent = current.lastSeenAt
        ? `${durationLabel(getActiveDurationForAccount(current))} • آخر ظهور ${timeAgo(current.lastSeenAt)}`
        : "لا يوجد نشاط مسجل";
    }

    if (els.saveProfileBtn) els.saveProfileBtn.disabled = false;
  }

  function renderPrivateView() {
    renderPrivateDrawerChatsList();
    renderPrivateConversation();
  }

  function renderAll() {
    renderShellState();
    renderHomeView();
    renderProfileView();
    renderPrivateView();
    renderUserView();
    renderMonitorPanel();
  }

  /* =========================
     VIEW MANAGEMENT
  ========================= */

  function closeMenuDrawer() {
    if (!els.menuDrawer) return;
    state.menuOpen = false;
    els.menuDrawer.classList.add("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "true");
  }

  function openMenuDrawer() {
    if (!els.menuDrawer) return;
    state.menuOpen = true;
    els.menuDrawer.classList.remove("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "false");
    renderMonitorPanel();
  }

  function setView(viewName) {
    state.view = viewName;

    const views = {
      home: els.homeView,
      profile: els.profileView,
      private: els.privateView,
      user: els.userView,
    };

    Object.entries(views).forEach(([name, el]) => {
      if (!el) return;
      el.classList.toggle("is-hidden", name !== viewName);
    });

    if (els.app) els.app.dataset.view = viewName;

    if (viewName === "home") {
      renderHomeView();
    } else if (viewName === "profile") {
      renderProfileView();
    } else if (viewName === "private") {
      renderPrivateView();
    } else if (viewName === "user") {
      renderUserView();
    }

    window.scrollTo(0, 0);
    closeMenuDrawer();
  }

  function openHome() {
    state.selectedUserId = null;
    state.selectedPrivatePeerId = null;
    setView("home");
  }

  function openProfile() {
    if (!canUseCurrentSession()) {
      showToast("لا يوجد حساب نشط.");
      return;
    }
    window.scrollTo(0, 0);
    state.selectedUserId = null;
    setView("profile");
    setTimeout(() => {
      window.scrollTo(0, 0);
      document.activeElement?.blur();
    }, 10);
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
      viewerLabel: normalizeText(viewerLabel) || "زائر",
      at: now(),
      read: false,
    });

    if (target.notifications.length > CONFIG.MAX_NOTIFICATIONS) {
      target.notifications = target.notifications.slice(-CONFIG.MAX_NOTIFICATIONS);
    }
  }

  function markCurrentNotificationsRead() {
    const current = getCurrentAccount();
    if (!current || !Array.isArray(current.notifications)) return;
    current.notifications.forEach((n) => {
      n.read = true;
    });
    saveStorage();
    renderShellState();
    renderMonitorPanel();
  }

  function openMonitorPanel() {
    if (!canUseCurrentSession()) {
      showToast("لا يوجد حساب نشط.");
      return;
    }
    markCurrentNotificationsRead();
    const count = getUnreadNotificationCount();
    if (!count) {
      showToast("لا توجد زيارات جديدة لملفك.");
      return;
    }
    showToast(`لديك ${count} زيارة/زيارات جديدة لملفك.`);
  }

  function openUserProfileById(userId) {
    if (!userId) return;

    const target = getAccountById(userId);
    if (!target) {
      showToast("المستخدم غير موجود.");
      return;
    }

    const current = getCurrentAccount();
    const viewerLabel = current ? getDisplayName(current) : "زائر";

    if (current && current.id === target.id) {
      openProfile();
      return;
    }

    state.selectedUserId = target.id;
    notifyProfileViewed(target.id, viewerLabel, current?.id || null);
    saveStorage();
    setView("user");
    renderUserView();
    renderMonitorPanel();
    setBridgeUser();
  }

  function openPrivateChat(peerId) {
    if (!peerId) return;
    const peer = getAccountById(peerId);
    if (!peer) {
      showToast("الشخص غير موجود.");
      return;
    }

    state.selectedPrivatePeerId = peer.id;
    state.selectedUserId = null;
    setView("private");
    renderPrivateConversation();
    focusInput(els.privateMessageInput);
  }

  /* =========================
     FORMS / INPUTS
  ========================= */

  function handleProfileSave(event) {
    event.preventDefault();

    const current = getCurrentAccount();
    if (!current) {
      showToast("لا يوجد حساب نشط.");
      return;
    }

    const newName = clampText(els.profileName?.value || "", CONFIG.MAX_NAME_LENGTH);
    const newPass = normalizeText(els.profilePassword?.value || "");
    const newAge = normalizeText(els.profileAge?.value || "");
    const newGender = normalizeText(els.profileGender?.value || "");
    const newNationality = normalizeText(els.profileNationality?.value || "");
    const newBio = normalizeText(els.profileBio?.value || "");

    if (!newName) {
      showToast("الاسم مطلوب.");
      return;
    }

    const existing = getAccountByUsername(newName);
    if (existing && existing.id !== current.id) {
      showToast("الاسم ده مستخدم بالفعل.");
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
      current.sessionExpiresAt = current.sessionExpiresAt || now() + CONFIG.SESSION_TTL_MS;
    }

    saveStorage();
    setBridgeUser();
    renderAll();
    showToast("تم حفظ الملف.");
  }

  function handleProfileImagePick(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 800 * 1024) {
      showToast("الصورة كبيرة جدًا. اختر صورة أخف.");
      event.target.value = "";
      return;
    }

    const current = getCurrentAccount();
    if (!current) {
      showToast("لا يوجد حساب نشط.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      current.profile.avatar = String(reader.result || "");
      saveStorage();
      setBridgeUser();
      renderProfileView();
      renderShellState();
      showToast("تم تحديث الصورة.");
    };
    reader.readAsDataURL(file);
  }

  function sendPublicMessage(text, silent = false) {
    const messageText = normalizeText(text);
    if (!messageText) {
      if (!silent) showToast("اكتب رسالة أولًا.");
      return false;
    }

    const current = getCurrentAccount();
    if (!current) {
      if (!silent) showToast("لا يوجد حساب نشط.");
      return false;
    }

    addPublicMessage(messageText, current.id, getDisplayName(current));
    markActivity();
    focusInput(els.publicMessageInput);
    return true;
  }

  function sendPrivateMessage(peerId, text, silent = false) {
    const messageText = normalizeText(text);

    if (!peerId) {
      if (!silent) showToast("اختر شخصًا أولًا.");
      return false;
    }

    if (!messageText) {
      if (!silent) showToast("اكتب رسالة أولًا.");
      return false;
    }

    const current = getCurrentAccount();
    const peer = getAccountById(peerId);

    if (!current || !peer) {
      if (!silent) showToast("تعذر إرسال الرسالة.");
      return false;
    }

    addPrivateMessage(peerId, messageText, current.id, getDisplayName(current));
    scheduleDemoReply(peerId, messageText);
    markActivity();
    focusInput(els.privateMessageInput);
    return true;
  }

  function handlePublicSubmit(event) {
    event.preventDefault();

    const text = normalizeText(els.publicMessageInput?.value || "");
    if (!text) {
      showToast("اكتب رسالة أولًا.");
      return;
    }

    if (!canUseCurrentSession()) {
      showToast("لا يوجد حساب نشط.");
      return;
    }

    sendPublicMessage(text);

    if (els.publicMessageInput) {
      els.publicMessageInput.value = "";
      els.publicMessageInput.focus();
    }
  }

  function handlePrivateSubmit(event) {
    event.preventDefault();

    const text = normalizeText(els.privateMessageInput?.value || "");
    const peerId = state.selectedPrivatePeerId;

    if (!peerId) {
      showToast("اختر شخصًا أولًا.");
      return;
    }

    if (!text) {
      showToast("اكتب رسالة أولًا.");
      return;
    }

    if (!canUseCurrentSession()) {
      showToast("لا يوجد حساب نشط.");
      return;
    }

    sendPrivateMessage(peerId, text);

    if (els.privateMessageInput) {
      els.privateMessageInput.value = "";
      els.privateMessageInput.focus();
    }
  }

  function handleAppTitleRefresh() {
    softRefresh();
  }

  function markActivity() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();

    if (!acc || !session || session.accountId !== acc.id) return;

    if (isSessionExpired(session)) {
      logoutCurrentAccount(false);
      showToast("انتهت الجلسة، سجّل دخول مرة أخرى.");
      return;
    }

    acc.lastSeenAt = now();

    if (state.activitySaveTimer) return;

    state.activitySaveTimer = window.setTimeout(() => {
      state.activitySaveTimer = null;
      saveStorage();
      renderShellState();
    }, 900);
  }

  function setBridgeUser() {
    const bridge = state.bridge || window.KAREEM3_DB;
    if (!bridge || typeof bridge.setUser !== "function") return;

    const current = getCurrentAccount();
    Promise.resolve(bridge.setUser(current ? { id: current.id, name: getDisplayName(current) } : null)).catch(() => {});
  }

  function setupBridge() {
    const bridge = window.KAREEM3_DB;
    if (!bridge || typeof bridge.init !== "function") return Promise.resolve(null);

    state.bridge = bridge;
    return bridge
      .init({ mode: "auto" })
      .then((status) => {
        state.bridgeStatus = status || bridge.getStatus?.() || null;
        setBridgeUser();
        return state.bridgeStatus;
      })
      .catch((err) => {
        console.warn("[KAREEM3_DB] Bridge init failed, continuing local mode:", err);
        state.bridgeStatus = { ready: false, mode: "local-fallback" };
        return state.bridgeStatus;
      });
  }

  function syncUserSearchInputs(value) {
    const normalized = normalizeText(value || "");
    state.searchQuery = normalized;

    if (els.userSearchInputHome && els.userSearchInputHome.value !== normalized) {
      els.userSearchInputHome.value = normalized;
    }

    if (els.userSearchInputDrawer && els.userSearchInputDrawer.value !== normalized) {
      els.userSearchInputDrawer.value = normalized;
    }

    renderUserSearchResults();
  }

  function handlePrivateChatListSearch(value) {
    state.privateSearchQuery = normalizeText(value || "");
    renderPrivateDrawerChatsList();
  }

  /* =========================
     DRAWER PANEL
  ========================= */

  function ensureMonitorPanel() {
    if (state.monitorPanelEl || !els.menuDrawer) return state.monitorPanelEl;

    const panel = document.createElement("section");
    panel.className = "drawer-section monitor-panel";
    panel.id = "monitorPanel";
    panel.innerHTML = `
      <div class="drawer-subhead">
        <h3 data-monitor-title>منظار ملفك</h3>
        <span class="tiny-count" data-monitor-count>0</span>
      </div>
      <div class="monitor-panel-body">
        <div class="empty-state empty-state-small" data-monitor-empty>سجّل دخولك عشان يظهر سجل الزيارات.</div>
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
    return panel;
  }

  /* =========================
     EVENTS / BINDING
  ========================= */

  function attachSendButtonKeyboardProtection() {
    [els.publicSendBtn, els.privateSendBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("pointerdown", (e) => e.preventDefault());
      btn.addEventListener("touchstart", (e) => e.preventDefault(), { passive: false });
    });
  }

  function attachPullToRefresh() {
    const root = els.appMain || els.app || document.body;
    if (!root) return;

    root.addEventListener(
      "touchstart",
      (e) => {
        if (window.scrollY > 0) return;
        state.pullRefresh.tracking = true;
        state.pullRefresh.startY = e.touches[0].clientY;
        state.pullRefresh.startX = e.touches[0].clientX;
      },
      { passive: true }
    );

    root.addEventListener(
      "touchmove",
      (e) => {
        if (!state.pullRefresh.tracking) return;
        const dy = e.touches[0].clientY - state.pullRefresh.startY;
        const dx = Math.abs(e.touches[0].clientX - state.pullRefresh.startX);

        if (dy > 110 && dx < 90) {
          state.pullRefresh.tracking = false;
          softRefresh();
        }
      },
      { passive: true }
    );

    root.addEventListener("touchend", () => {
      state.pullRefresh.tracking = false;
    });
  }

  function bindEvents() {
    els.menuBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      if (state.menuOpen) closeMenuDrawer();
      else openMenuDrawer();
    });

    els.privateShortcutBtn?.addEventListener("click", (event) => {
      event.stopPropagation();
      setView("private");
      renderPrivateView();
    });

    els.appTitleBtn?.addEventListener("click", handleAppTitleRefresh);

    els.publicMessageForm?.addEventListener("submit", handlePublicSubmit);
    els.privateMessageForm?.addEventListener("submit", handlePrivateSubmit);
    els.profileForm?.addEventListener("submit", handleProfileSave);
    els.profileImageInput?.addEventListener("change", handleProfileImagePick);

    els.openMyProfileFromMenu?.addEventListener("click", openProfile);
    els.drawerProfileBtn?.addEventListener("click", openProfile);
    els.drawerMonitorBtn?.addEventListener("click", openMonitorPanel);
    els.drawerSettingsBtn?.addEventListener("click", () => showToast("الإعدادات هتتضاف لاحقًا."));
    els.drawerLogoutBtn?.addEventListener("click", () => {
      if (!getCurrentAccount()) {
        showToast("لا يوجد حساب نشط.");
        return;
      }
      logoutCurrentAccount(true);
    });

    els.backFromProfileBtn?.addEventListener("click", openHome);
    els.closeProfileBtn?.addEventListener("click", openHome);
    els.backFromPrivateBtn?.addEventListener("click", openHome);
    els.backFromUserViewBtn?.addEventListener("click", openHome);
    els.closeUserViewBtn?.addEventListener("click", openHome);

    els.startPrivateChatBtn?.addEventListener("click", () => {
      const targetId = els.startPrivateChatBtn?.dataset?.targetId;
      if (!targetId) return;
      openPrivateChat(targetId);
    });

    els.userSearchInputHome?.addEventListener("input", (e) => syncUserSearchInputs(e.target.value));
    els.userSearchInputDrawer?.addEventListener("input", (e) => syncUserSearchInputs(e.target.value));

    els.privateSearchInput?.addEventListener("input", (e) => handlePrivateChatListSearch(e.target.value));

    els.publicMessageInput?.addEventListener("focus", () => markActivity());
    els.privateMessageInput?.addEventListener("focus", () => markActivity());

    document.addEventListener("click", (event) => {
      if (!state.menuOpen) return;
      if (!(event.target instanceof Node)) return;
      const insideMenu = els.menuDrawer?.contains(event.target);
      const insideMenuBtn = els.menuBtn?.contains(event.target);
      if (!insideMenu && !insideMenuBtn) closeMenuDrawer();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (state.menuOpen) {
        closeMenuDrawer();
        return;
      }
      if (state.view !== "home") openHome();
    });

    window.addEventListener("storage", () => {
      readStorage();
      ensureDemoAccounts();
      ensureWelcomePublicMessage();
      ensureCurrentAccount();
      renderAll();
      setBridgeUser();
    });

    window.addEventListener("resize", () => {
      ensureMonitorPanel();
    });

    attachSendButtonKeyboardProtection();
    attachPullToRefresh();
  }

  /* =========================
     PRIVATE / PUBLIC OPENERS
  ========================= */

  function openPrivatePage() {
    setView("private");
    renderPrivateView();
  }

  function bindLowLevelAliases() {
    window.KAREEM3 = {
      refresh: softRefresh,
      logout: logoutCurrentAccount,
      openHome,
      openProfile,
      openUserProfileById,
      openPrivateChat,
      openPrivatePage,
      openMenuDrawer,
      closeMenuDrawer,
      state: () => ({
        currentAccount: getCurrentAccount(),
        currentSession: getCurrentSession(),
        unreadNotifications: getUnreadNotificationCount(),
        view: state.view,
        menuOpen: state.menuOpen,
      }),
    };
  }

  /* =========================
     INITIALIZATION
  ========================= */

  function initInputsText() {
    if (els.privateShortcutBtn) els.privateShortcutBtn.setAttribute("aria-label", "الرسائل الخاصة");
  }

  function cacheElements() {
    els.app = $("app");
    els.appHeader = $("appHeader") || $("topbar");
    els.appMain = $("appMain") || $("homeView");

    els.privateShortcutBtn = $("privateShortcutBtn");
    els.appTitleBtn = $("appTitleBtn");
    els.menuBtn = $("menuBtn");

    els.currentUserState = $("currentUserState");

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
    els.userSearchInputHome = $("userSearchInputHome");
    els.userSearchInputDrawer = $("userSearchInputDrawer");
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
    els.privateChatAvatar = $("privateChatAvatar");
    els.privateChatTitle = $("privateChatTitle");
    els.privateChatMeta = $("privateChatMeta");
    els.privateMessages = $("privateMessages");
    els.privateMessageForm = $("privateMessageForm");
    els.privateMessageInput = $("privateMessageInput");
    els.privateSendBtn = $("privateSendBtn");
    els.privateChatsEmpty = $("privateChatsEmpty");
    els.privateChatsList = $("privateChatsList");

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

  function softRefresh() {
    readStorage();
    ensureDemoAccounts();
    ensureWelcomePublicMessage();
    ensureCurrentAccount();
    prunePublicMessages();
    prunePrivateThreads();
    saveStorage();
    renderAll();
    setBridgeUser();
  }

  async function init() {
    if (state.ready) return;
    state.ready = true;

    cacheElements();
    initInputsText();
    readStorage();
    ensureDemoAccounts();
    ensureWelcomePublicMessage();
    ensureCurrentAccount();
    ensureMonitorPanel();
    bindEvents();
    setView(state.view || "home");
    renderAll();
    setBridgeUser();
    await setupBridge();
    setBridgeUser();
    if (canUseCurrentSession()) markActivity();
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await init();
    bindLowLevelAliases();
  });
})();
