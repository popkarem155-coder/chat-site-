(() => {
  "use strict";

  const STORAGE_KEYS = {
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
    ready: false,
    accounts: [],
    publicMessages: [],
    privateThreads: {},
    currentAccountId: null,
    selectedPrivatePeerId: null,
    selectedUserId: null,
    pendingAction: null,
    activitySaveTimer: null,
    intervalTimer: null,
    view: "home",
    searchQuery: "",
    privateSearchQuery: "",
    bridge: null,
    bridgeStatus: null,
    monitorPanelEl: null,
    menuOverlayEl: null,
    privateOverlayEl: null,
    privateDrawerEl: null,
    toastHostEl: null,
    pullRefresh: {
      tracking: false,
      startY: 0,
      startX: 0,
    },
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
      if (value === null || value === undefined || value === "") return fallback;
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

    if (diff < minute) return "منذ لحظات";
    if (diff < hour) return `منذ ${Math.floor(diff / minute)} دقيقة`;
    if (diff < day) return `منذ ${Math.floor(diff / hour)} ساعة`;
    return `منذ ${Math.floor(diff / day)} يوم`;
  }

  function durationLabel(ms) {
    const totalMinutes = Math.floor(Math.max(0, ms) / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours <= 0) return `نشط منذ ${minutes} دقيقة`;
    if (minutes <= 0) return `نشط منذ ${hours} ساعة`;
    return `نشط منذ ${hours} ساعة و${minutes} دقيقة`;
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
    if (!account) return "مستخدم";
    const name = clampText(
      account.profile?.name || account.username || "مستخدم",
      CONFIG.MAX_NAME_LENGTH
    );
    return name || "مستخدم";
  }

  function getAvatarInitial(account) {
    const name = getDisplayName(account);
    return name ? name[0] : "؟";
  }

  function getCurrentSession() {
    return safeJSONParse(localStorage.getItem(STORAGE_KEYS.currentSession), null);
  }

  function isSessionExpired(session) {
    if (!session || !session.expiresAt) return true;
    return now() > Number(session.expiresAt);
  }

  function saveCurrentSession(session) {
    try {
      localStorage.setItem(
        STORAGE_KEYS.currentSession,
        safeJSONStringify(session, "{}")
      );
    } catch {}
  }

  function saveStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEYS.accounts,
        safeJSONStringify(state.accounts, "[]")
      );
      localStorage.setItem(
        STORAGE_KEYS.publicMessages,
        safeJSONStringify(state.publicMessages, "[]")
      );
      localStorage.setItem(
        STORAGE_KEYS.privateThreads,
        safeJSONStringify(state.privateThreads, "{}")
      );

      if (state.currentAccountId) {
        const acc = getCurrentAccount();
        if (acc) {
          saveCurrentSession({
            accountId: state.currentAccountId,
            startedAt: acc.sessionStartedAt || now(),
            expiresAt: acc.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS),
          });
        }
      } else {
        localStorage.removeItem(STORAGE_KEYS.currentSession);
      }
    } catch (err) {
      showToast("تعذر حفظ البيانات. تأكد أن مساحة التخزين متاحة.");
      console.error(err);
    }
  }

  function readStorage() {
    state.accounts = safeJSONParse(localStorage.getItem(STORAGE_KEYS.accounts), []);
    state.publicMessages = safeJSONParse(
      localStorage.getItem(STORAGE_KEYS.publicMessages),
      []
    );
    state.privateThreads = safeJSONParse(
      localStorage.getItem(STORAGE_KEYS.privateThreads),
      {}
    );
  }

  function getCurrentAccount() {
    if (!state.currentAccountId) return null;
    return getAccountById(state.currentAccountId);
  }

  function isAccountOnline(acc) {
    if (!acc) return false;

    if (acc.id === state.currentAccountId) {
      const session = getCurrentSession();
      if (!session || isSessionExpired(session)) return false;
      return now() - Number(acc.lastSeenAt || 0) <= CONFIG.ONLINE_WINDOW_MS;
    }

    return now() - Number(acc.lastSeenAt || 0) <= CONFIG.ONLINE_WINDOW_MS;
  }

  function isAccountFeatured(acc) {
    if (!acc) return false;
    if (!isAccountOnline(acc)) return false;
    return getActiveDurationForAccount(acc) >= CONFIG.FEATURED_WINDOW_MS;
  }

  function getActiveDurationForAccount(acc) {
    if (!acc) return 0;

    const session = getCurrentSession();
    if (
      session &&
      session.accountId === acc.id &&
      !isSessionExpired(session)
    ) {
      return (
        Number(acc.totalActiveMs || 0) +
        Math.max(0, now() - Number(session.startedAt || now()))
      );
    }

    return Number(acc.totalActiveMs || 0);
  }

  function setAvatar(el, account, fallbackLabel = "؟") {
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

  function ensureCurrentAccount() {
    const session = getCurrentSession();

    if (session && session.accountId) {
      const acc = getAccountById(session.accountId);
      if (acc && !isSessionExpired(session)) {
        state.currentAccountId = acc.id;
        acc.sessionStartedAt = Number(session.startedAt || now());
        acc.sessionExpiresAt = Number(
          session.expiresAt || (now() + CONFIG.SESSION_TTL_MS)
        );
        acc.lastSeenAt = acc.lastSeenAt || now();
        return acc;
      }
    }

    const guestSeed =
      safeJSONParse(localStorage.getItem(STORAGE_KEYS.guestSeed), null) || {
        id: createId("acc"),
        createdAt: now(),
      };

    try {
      localStorage.setItem(
        STORAGE_KEYS.guestSeed,
        safeJSONStringify(guestSeed, "{}")
      );
    } catch {}

    let guest = getAccountById(guestSeed.id);
    if (!guest) {
      guest = {
        id: guestSeed.id,
        username: "زائر",
        password: "",
        createdAt: guestSeed.createdAt,
        lastSeenAt: now(),
        totalActiveMs: 0,
        sessionStartedAt: now(),
        sessionExpiresAt: now() + CONFIG.SESSION_TTL_MS,
        profile: {
          name: "زائر",
          age: "",
          gender: "",
          nationality: "",
          bio: "حساب افتراضي للتجربة.",
          avatar: "",
        },
        notifications: [],
        isDemo: false,
      };
      state.accounts.push(guest);
    }

    state.currentAccountId = guest.id;
    saveCurrentSession({
      accountId: guest.id,
      startedAt: now(),
      expiresAt: now() + CONFIG.SESSION_TTL_MS,
    });

    return guest;
  }

  function ensureDemoUsers() {
    const demoSet = [
      {
        username: "صديق تجريبي",
        profile: {
          name: "صديق تجريبي",
          bio: "حساب تجريبي لاختبار الرسائل الخاصة.",
          nationality: "تجريبي",
        },
        lastSeenOffsetMs: 4 * 60 * 1000,
        activeMs: 3 * 60 * 60 * 1000,
      },
      {
        username: "سارة",
        profile: {
          name: "سارة",
          bio: "جاهزة لتجربة الدردشة.",
          nationality: "مصرية",
        },
        lastSeenOffsetMs: 9 * 60 * 1000,
        activeMs: 4 * 60 * 60 * 1000,
      },
      {
        username: "أحمد",
        profile: {
          name: "أحمد",
          bio: "مستخدم تجريبي إضافي.",
          nationality: "مصري",
        },
        lastSeenOffsetMs: 3 * 60 * 60 * 1000,
        activeMs: 90 * 60 * 1000,
      },
    ];

    demoSet.forEach((item) => {
      let acc = getAccountByUsername(item.username);
      if (!acc) {
        acc = {
          id: createId("acc"),
          username: item.username,
          password: "",
          createdAt: now(),
          lastSeenAt: now(),
          totalActiveMs: 0,
          sessionStartedAt: null,
          sessionExpiresAt: null,
          profile: {
            name: item.profile.name,
            age: "",
            gender: "",
            nationality: item.profile.nationality || "",
            bio: item.profile.bio || "",
            avatar: "",
          },
          notifications: [],
          isDemo: true,
        };
        state.accounts.push(acc);
      }

      acc.isDemo = true;
      acc.username = item.username;
      acc.profile = acc.profile || {};
      acc.profile.name = item.profile.name;
      acc.profile.bio = item.profile.bio || acc.profile.bio || "";
      acc.profile.nationality = item.profile.nationality || acc.profile.nationality || "";
      acc.lastSeenAt = now() - item.lastSeenOffsetMs;
      acc.totalActiveMs = Math.max(Number(acc.totalActiveMs || 0), item.activeMs);
      acc.notifications = Array.isArray(acc.notifications) ? acc.notifications : [];
    });
  }

  function ensureWelcomePublicMessage() {
    if (!Array.isArray(state.publicMessages) || !state.publicMessages.length) {
      const current = getCurrentAccount();
      const sender = current || state.accounts[0] || null;

      if (sender) {
        state.publicMessages = [
          {
            id: createId("msg"),
            senderId: sender.id,
            senderLabel: getDisplayName(sender),
            text: "أهلًا بك في شات نار. جرّب اكتب رسالة.",
            at: now() - 5 * 60 * 1000,
          },
        ];
      }
    }
  }

  function getThreadKey(a, b) {
    return [a, b].sort().join("__");
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

  function prunePublicMessages() {
    if (!Array.isArray(state.publicMessages)) state.publicMessages = [];
    if (state.publicMessages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      state.publicMessages = state.publicMessages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
    }
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

  function getCurrentPublicMessages() {
    return Array.isArray(state.publicMessages) ? state.publicMessages : [];
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

    const thread = getThread(current.id, peerId, true);
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

    if (thread.messages.length > CONFIG.PUBLIC_MESSAGE_CAP) {
      thread.messages = thread.messages.slice(-CONFIG.PUBLIC_MESSAGE_CAP);
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
    }, 900);
  }

  function setBridgeUser() {
    const bridge = state.bridge || window.KAREEM3_DB;
    if (!bridge || typeof bridge.setUser !== "function") return;

    const current = getCurrentAccount();
    bridge
      .setUser(
        current
          ? { id: current.id, name: getDisplayName(current) }
          : null
      )
      .catch?.(() => {});
  }

  function softRefresh() {
    readStorage();
    ensureCurrentAccount();
    ensureDemoUsers();
    ensureWelcomePublicMessage();
    prunePublicMessages();
    prunePrivateThreads();
    saveStorage();
    renderAll();
    setBridgeUser();
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

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, CONFIG.TOAST_MS);
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

  function makeOverlay(id, zIndex) {
    let overlay = $(id);
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.id = id;
      document.body.appendChild(overlay);
    }

    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(7, 7, 10, 0.72)";
    overlay.style.backdropFilter = "blur(14px)";
    overlay.style.webkitBackdropFilter = "blur(14px)";
    overlay.style.zIndex = String(zIndex);
    overlay.style.display = "none";
    overlay.style.pointerEvents = "auto";
    overlay.className = overlay.className || "drawer-overlay";

    return overlay;
  }

  function setOverlayVisible(overlay, visible) {
    if (!overlay) return;
    overlay.style.display = visible ? "block" : "none";
  }

  function updateBodyScrollLock() {
    const locked = state.menuOpen || state.privateDrawerOpen;

    document.body.style.overflow = locked ? "hidden" : "";
  }

  function positionDrawerSide(drawer, side = "right") {
    if (!drawer) return;

    const gap = window.innerWidth <= 720 ? "8px" : "12px";
    drawer.style.position = "fixed";
    drawer.style.top = gap;
    drawer.style.maxHeight = `calc(100dvh - ${window.innerWidth <= 720 ? "16px" : "24px"})`;

    if (side === "right") {
      drawer.style.right = gap;
      drawer.style.left = "auto";
    } else {
      drawer.style.left = gap;
      drawer.style.right = "auto";
    }
  }

  function ensurePrivateDrawer() {
    if (state.privateDrawerEl) return state.privateDrawerEl;

    const drawer = document.createElement("aside");
    drawer.id = "privateDrawer";
    drawer.className = "drawer private-drawer is-hidden";
    drawer.setAttribute("aria-hidden", "true");
    drawer.setAttribute("role", "dialog");
    drawer.innerHTML = `
      <div class="drawer-head">
        <button id="privateDrawerCloseBtn" class="profile-card" type="button">
          <div class="avatar avatar-lg">✉</div>
          <div class="profile-card-text">
            <strong>الرسائل الخاصة</strong>
            <span>ابحث بين الأشخاص اللي كلمتهم</span>
          </div>
        </button>
      </div>

      <div class="drawer-section">
        <label class="search-box" for="privateSearchInput">
          <span class="search-label">بحث في المحادثات</span>
          <input id="privateSearchInput" type="search" placeholder="ابحث بين الأشخاص اللي كلمتهم..." autocomplete="off" />
        </label>

        <div class="drawer-subhead">
          <h3>آخر المحادثات</h3>
          <span id="privateChatsCount" class="tiny-count">0</span>
        </div>

        <div id="privateChatsEmpty" class="empty-state empty-state-small">لسه ما كلمتش حد في الخاص.</div>
        <div id="privateChatsList" class="private-chats-list" role="list"></div>
      </div>
    `;

    document.body.appendChild(drawer);

    state.privateDrawerEl = drawer;
    els.privateDrawerCloseBtn = drawer.querySelector("#privateDrawerCloseBtn");
    els.privateSearchInput = drawer.querySelector("#privateSearchInput");
    els.privateChatsCount = drawer.querySelector("#privateChatsCount");
    els.privateChatsEmpty = drawer.querySelector("#privateChatsEmpty");
    els.privateChatsList = drawer.querySelector("#privateChatsList");

    positionDrawerSide(drawer, "left");

    return drawer;
  }

  function ensureMonitorPanel() {
    if (state.monitorPanelEl) return state.monitorPanelEl;
    if (!els.menuDrawer) return null;

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

  function openMenuDrawer() {
    if (!els.menuDrawer) return;
    ensurePrivateDrawer();
    closePrivateDrawer();
    state.menuOpen = true;
    els.menuDrawer.classList.remove("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "false");
    if (els.menuDrawerOverlay) setOverlayVisible(els.menuDrawerOverlay, true);
    updateBodyScrollLock();
  }

  function closeMenuDrawer() {
    if (!els.menuDrawer) return;
    state.menuOpen = false;
    els.menuDrawer.classList.add("is-hidden");
    els.menuDrawer.setAttribute("aria-hidden", "true");
    if (els.menuDrawerOverlay) setOverlayVisible(els.menuDrawerOverlay, false);
    updateBodyScrollLock();
  }

  function openPrivateDrawer() {
    const drawer = ensurePrivateDrawer();
    if (!drawer) return;

    closeMenuDrawer();
    state.privateDrawerOpen = true;
    drawer.classList.remove("is-hidden");
    drawer.setAttribute("aria-hidden", "false");
    if (els.privateDrawerOverlay) setOverlayVisible(els.privateDrawerOverlay, true);
    updateBodyScrollLock();
    renderPrivateDrawerChatsList();
  }

  function closePrivateDrawer() {
    const drawer = state.privateDrawerEl;
    if (!drawer) return;

    state.privateDrawerOpen = false;
    drawer.classList.add("is-hidden");
    drawer.setAttribute("aria-hidden", "true");
    if (els.privateDrawerOverlay) setOverlayVisible(els.privateDrawerOverlay, false);
    updateBodyScrollLock();
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

    const isActive = name === viewName;

    el.classList.toggle("is-hidden", !isActive);
    el.classList.toggle("is-active", isActive);
  });

  if (els.app) els.app.dataset.view = viewName;

  closeMenuDrawer();
  closePrivateDrawer();

  switch (viewName) {
    case "home":
      renderHomeView();
      break;
    case "profile":
      renderProfileView();
      break;
    case "private":
      renderPrivateConversation();
      break;
    case "user":
      renderUserView();
      break;
  }
}

/* ===================== HOME ===================== */

function openHome() {
  state.selectedUserId = null;
  state.selectedPrivatePeerId = null;
  setView("home");
}


/* ===================== PROFILE ===================== */

function openProfile() {
  if (!canUseCurrentSession()) return;

  window.scrollTo(0, 0);

  state.selectedUserId = null;
  setView("profile");

  setTimeout(() => {
    window.scrollTo(0, 0);
    document.activeElement?.blur();
  }, 10);
}


/* ===================== USER PROFILE BY ID ===================== */

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

  notifyProfileViewed(
    target.id,
    viewerLabel,
    current?.id || null
  );

  saveStorage();
  setView("user");
}


/* ===================== PRIVATE CHAT ===================== */

function openPrivateChat(peerId, silent = false) {
  const peer = getAccountById(peerId);

  if (!peer) {
    if (!silent) showToast("الشخص غير موجود.");
    return;
  }

  state.selectedPrivatePeerId = peer.id;
  state.selectedUserId = null;

  closePrivateDrawer();
  setView("private");

  focusInput(els.privateMessageInput);
}


/* ===================== MONITOR PANEL ===================== */

function openMonitorPanel() {
  if (!canUseCurrentSession()) return;

  openMenuDrawer();
  markCurrentNotificationsRead();
  renderMonitorPanel();

  if (state.monitorPanelEl) {
    state.monitorPanelEl.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
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

  function loginAccount(account) {
    if (!account) return;

    const startedAt = now();
    account.lastSeenAt = startedAt;
    account.sessionStartedAt = startedAt;
    account.sessionExpiresAt = startedAt + CONFIG.SESSION_TTL_MS;

    state.currentAccountId = account.id;
    saveCurrentSession({
      accountId: account.id,
      startedAt,
      expiresAt: account.sessionExpiresAt,
    });

    saveStorage();
    renderAll();
    setBridgeUser();
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
    localStorage.removeItem(STORAGE_KEYS.currentSession);
    state.currentAccountId = null;
    saveStorage();
  }

  function logoutCurrentAccount(showMessage = true) {
    commitCurrentSession(true);
    state.selectedPrivatePeerId = null;
    state.selectedUserId = null;
    ensureCurrentAccount();
    saveStorage();
    setBridgeUser();
    renderAll();

    if (showMessage) showToast("تم تسجيل الخروج.");
  }

  function canUseCurrentSession() {
    const acc = getCurrentAccount();
    const session = getCurrentSession();

    if (!acc || !session) return false;
    if (session.accountId !== acc.id) return false;
    if (isSessionExpired(session)) return false;

    return true;
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
        console.warn(
          "[KAREEM3_DB] Bridge init failed, continuing local mode:",
          err
        );
        state.bridgeStatus = { ready: false, mode: "local-fallback" };
        return state.bridgeStatus;
      });
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

    window.setTimeout(() => {
      toast.classList.remove("is-visible");
      window.setTimeout(() => toast.remove(), 220);
    }, CONFIG.TOAST_MS);
  }

  function getDisplayModeLabel() {
    const current = getCurrentAccount();
    if (!current) return "زائر";
    if (isAccountFeatured(current)) return `${getDisplayName(current)} • مستخدم مميز`;
    if (isAccountOnline(current)) return `${getDisplayName(current)} • متصل الآن`;
    return `${getDisplayName(current)} • غير نشط`;
  }

  function renderShellState() {
    const current = getCurrentAccount();

    if (els.currentUserState) {
      els.currentUserState.textContent = getDisplayModeLabel();
    }

    if (els.menuUserName) {
      els.menuUserName.textContent = current ? getDisplayName(current) : "ملفي الشخصي";
    }

    if (els.menuUserMeta) {
      els.menuUserMeta.textContent = current
        ? `اضغط لفتح الملف وتعديل البيانات • ${isAccountFeatured(current) ? "مستخدم مميز" : "حساب عادي"}`
        : "سجل دخول أو أنشئ حساب تجريبي";
    }

    if (els.menuAvatar) {
      setAvatar(els.menuAvatar, current, current ? getAvatarInitial(current) : "ز");
    }

    if (els.profileBadge) {
      els.profileBadge.textContent = String(getUnreadNotificationCount());
    }

    if (els.drawerMonitorBadge) {
      els.drawerMonitorBadge.textContent = String(getUnreadNotificationCount());
    }

    if (els.privateChatsCount) {
      els.privateChatsCount.textContent = String(getPrivateChatMatches().length);
    }

    if (els.profileSub) {
      els.profileSub.textContent = current
        ? `${isAccountFeatured(current) ? "مستخدم مميز" : "حساب عادي"}`
        : "الملف الشخصي";
    }

    if (els.publicMessageInput) {
      els.publicMessageInput.placeholder = current
        ? "اكتب رسالتك في الشات العام"
        : "جهز حسابًا أولًا";
    }

    if (els.publicSendBtn) els.publicSendBtn.textContent = "إرسال";
    if (els.privateSendBtn) els.privateSendBtn.textContent = "إرسال";
  }

  function buildMessageElement(message) {
    const sender = getAccountById(message.senderId);
    const senderName = normalizeText(
      sender ? getDisplayName(sender) : message.senderLabel || "مستخدم"
    );

    const article = document.createElement("article");
    article.className = "message-item";
    if (
      message.senderId &&
      state.currentAccountId &&
      message.senderId === state.currentAccountId
    ) {
      article.classList.add("is-own");
    }

    const head = document.createElement("div");
    head.className = "message-head";

    const avatar = document.createElement("button");
    avatar.type = "button";
    avatar.className = "message-avatar";
    setAvatar(avatar, sender, senderName ? senderName[0] : "؟");
    avatar.title = `فتح ملف ${senderName}`;
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
      empty.textContent = "لسه ما فيش رسائل ظاهرة هنا.";
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
      row.addEventListener("click", () => openAccountProfileById(acc.id));

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
      row.addEventListener("click", () => openAccountProfileById(acc.id));

      els.featuredUsersList.appendChild(row);
    });
  }

  function renderHomeView() {
    renderShellState();
    renderPublicMessages();
    renderOnlineUsers();
    renderFeaturedUsers();
    renderUserSearchResults();
    renderPrivateDrawerChatsList();
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
      els.profileOnlineState.textContent = isAccountOnline(current) ? "متصل الآن" : "غير نشط";
    }

    if (els.profileLastSeen) {
      els.profileLastSeen.textContent = current.lastSeenAt
        ? `${durationLabel(getActiveDurationForAccount(current))} • آخر ظهور ${timeAgo(current.lastSeenAt)}`
        : "لا يوجد نشاط مسجل";
    }
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
      els.privateChatsEmpty.textContent = state.privateSearchQuery
        ? "مافيش محادثات مطابقة."
        : "لسه ما كلمتش حد في الخاص.";
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
        if (item.peerId) openPrivateChat(item.peerId, true);
      });

      els.privateChatsList.appendChild(btn);
    });
  }

  function renderPrivateConversation() {
    if (
      !els.privateMessages ||
      !els.privateChatTitle ||
      !els.privateChatMeta ||
      !els.privateChatAvatar
    ) {
      return;
    }

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

    if (els.profileBadge) els.profileBadge.textContent = String(unreadCount);
    if (els.drawerMonitorBadge) els.drawerMonitorBadge.textContent = String(unreadCount);

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

  function renderUserSearchResults() {
    if (!els.userSearchResults || !els.searchResultCount) return;

    const query = normalizeText(
      els.userSearchInputHome?.value || els.userSearchInputDrawer?.value || ""
    );

    state.searchQuery = query;

    if (els.userSearchInputHome && els.userSearchInputHome.value !== query) {
      els.userSearchInputHome.value = query;
    }
    if (els.userSearchInputDrawer && els.userSearchInputDrawer.value !== query) {
      els.userSearchInputDrawer.value = query;
    }

    els.userSearchResults.innerHTML = "";

    if (!query) {
      els.searchResultCount.textContent = "0";
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
      return (
        name.includes(q) ||
        profileName.includes(q) ||
        bio.includes(q) ||
        nationality.includes(q)
      );
    });

    els.searchResultCount.textContent = String(results.length);

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
      item.addEventListener("click", () => openAccountProfileById(acc.id));

      els.userSearchResults.appendChild(item);
    });
  }

  function renderAll() {
    renderShellState();
    renderHomeView();
    renderProfileView();
    renderPrivateDrawerChatsList();
    renderPrivateConversation();
    renderUserView();
    renderMonitorPanel();
    renderUserSearchResults();
    positionDrawers();
  }

  function renderPrivateViewIfNeeded() {
    if (state.view === "private") {
      renderPrivateConversation();
    }
  }

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
      current.sessionExpiresAt = current.sessionExpiresAt || (now() + CONFIG.SESSION_TTL_MS);
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

    els.publicMessageInput.value = "";
    els.publicMessageInput.focus();
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

  function handleAppTitleClick() {
    softRefresh();
  }

  function handlePrivateShortcutClick() {
    if (!state.privateDrawerOpen) {
      openPrivateDrawer();
    } else {
      closePrivateDrawer();
    }
  }

  function handleBackFromPrivate() {
    closePrivateDrawer();
    openHome();
  }

  function attachSendButtonKeyboardProtection() {
    [els.publicSendBtn, els.privateSendBtn].forEach((btn) => {
      if (!btn) return;
      btn.addEventListener("pointerdown", (e) => e.preventDefault());
      btn.addEventListener(
        "touchstart",
        (e) => e.preventDefault(),
        { passive: false }
      );
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
    if (els.menuBtn) {
      els.menuBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (state.menuOpen) {
          closeMenuDrawer();
        } else {
          openMenuDrawer();
        }
      });
    }

    if (els.messagesBtn) {
      els.messagesBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        handlePrivateShortcutClick();
      });
    }

    if (els.menuDrawerOverlay) {
      els.menuDrawerOverlay.addEventListener("click", closeMenuDrawer);
    }

    if (els.privateDrawerOverlay) {
      els.privateDrawerOverlay.addEventListener("click", closePrivateDrawer);
    }

    if (els.privateDrawerCloseBtn) {
      els.privateDrawerCloseBtn.addEventListener("click", closePrivateDrawer);
    }

    els.appTitleBtn?.addEventListener("click", handleAppTitleClick);

    els.publicMessageForm?.addEventListener("submit", handlePublicSubmit);
    els.privateMessageForm?.addEventListener("submit", handlePrivateSubmit);
    els.profileForm?.addEventListener("submit", handleProfileSave);
    els.profileImageInput?.addEventListener("change", handleProfileImagePick);

    els.openMyProfileFromMenu?.addEventListener("click", openProfile);
    els.drawerProfileBtn?.addEventListener("click", openProfile);
    els.drawerMonitorBtn?.addEventListener("click", openMonitorPanel);
    els.drawerSettingsBtn?.addEventListener("click", () => {
      showToast("الإعدادات هتتضاف لاحقًا.");
    });

    els.drawerLogoutBtn?.addEventListener("click", () => {
      if (!getCurrentAccount()) {
        showToast("لا يوجد حساب نشط.");
        return;
      }
      logoutCurrentAccount(true);
    });

    els.backFromProfileBtn?.addEventListener("click", () => openHome());
    els.closeProfileBtn?.addEventListener("click", () => openHome());
    els.backFromPrivateBtn?.addEventListener("click", handleBackFromPrivate);
    els.backFromUserViewBtn?.addEventListener("click", () => openHome());
    els.closeUserViewBtn?.addEventListener("click", () => openHome());

    els.startPrivateChatBtn?.addEventListener("click", () => {
      const targetId = els.startPrivateChatBtn?.dataset?.targetId;
      if (!targetId) return;
      openPrivateChat(targetId, true);
    });

    els.userSearchInputHome?.addEventListener("input", (e) => {
      syncUserSearchInputs(e.target.value);
    });

    els.userSearchInputDrawer?.addEventListener("input", (e) => {
      syncUserSearchInputs(e.target.value);
    });

    els.privateSearchInput?.addEventListener("input", (e) => {
      state.privateSearchQuery = normalizeText(e.target.value || "");
      renderPrivateDrawerChatsList();
    });

    els.publicMessageInput?.addEventListener("focus", () => markActivity());
    els.privateMessageInput?.addEventListener("focus", () => markActivity());

    document.addEventListener("click", (event) => {
      if (!state.menuOpen && !state.privateDrawerOpen) return;
      if (!(event.target instanceof Node)) return;

      const insideMenu = els.menuDrawer?.contains(event.target);
      const insidePrivate = state.privateDrawerEl?.contains(event.target);
      const insideMenuBtn = els.menuBtn?.contains(event.target);
      const insidePrivateBtn = els.messagesBtn?.contains(event.target);
      const insideOverlay =
        els.menuDrawerOverlay?.contains(event.target) ||
        els.privateDrawerOverlay?.contains(event.target);

      if (insideOverlay) return;

      if (state.menuOpen && !insideMenu && !insideMenuBtn) {
        closeMenuDrawer();
      }

      if (state.privateDrawerOpen && !insidePrivate && !insidePrivateBtn) {
        closePrivateDrawer();
      }
    });

    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;

      if (state.privateDrawerOpen) {
        closePrivateDrawer();
        return;
      }

      if (state.menuOpen) {
        closeMenuDrawer();
        return;
      }

      if (state.view !== "home") {
        openHome();
      }
    });

    window.addEventListener("storage", () => {
      readStorage();
      ensureCurrentAccount();
      ensureDemoUsers();
      ensureWelcomePublicMessage();
      prunePublicMessages();
      prunePrivateThreads();
      saveStorage();
      renderAll();
      setBridgeUser();
    });

    window.addEventListener("resize", () => {
      positionDrawers();
    });

    attachSendButtonKeyboardProtection();
    attachPullToRefresh();
  }

  function positionDrawers() {
    if (els.menuDrawer) {
      positionDrawerSide(els.menuDrawer, "right");
    }

    if (state.privateDrawerEl) {
      positionDrawerSide(state.privateDrawerEl, "left");
    }
  }

  function initInputsText() {
    if (els.messagesBtn) els.messagesBtn.textContent = "✉";
    if (els.menuBtn) els.menuBtn.textContent = "☰";
  }

  async function init() {
    if (state.ready) return;
    state.ready = true;

    cacheElements();
    initInputsText();
    makeOverlay("menuDrawerOverlay", 88);
    makeOverlay("privateDrawerOverlay", 87);
    ensurePrivateDrawer();
    ensureCurrentAccount();
    ensureDemoUsers();
    ensureWelcomePublicMessage();
    prunePublicMessages();
    prunePrivateThreads();
    saveStorage();
    ensureMonitorPanel();
    bindEvents();
    positionDrawers();
    renderAll();
    setBridgeUser();
    await setupBridge();
    setBridgeUser();
    if (canUseCurrentSession()) markActivity();
  }

  function cacheElements() {
    els.app = $("app");
    els.appHeader = $("appHeader") || $("topbar");
    els.appMain = $("appMain") || $("homeView");

    els.messagesBtn = $("messagesBtn") || $("privateShortcutBtn");
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
    els.profileSub = $("profileSub");
    els.userSearchInputHome = $("userSearchInputHome");
    els.userSearchInputDrawer = $("userSearchInputDrawer");
    els.searchResultCount = $("searchResultCount");
    els.userSearchResults = $("userSearchResults");
    els.drawerProfileBtn = $("drawerProfileBtn");
    els.drawerMonitorBtn = $("drawerMonitorBtn");
    els.drawerSettingsBtn = $("drawerSettingsBtn");
    els.drawerLogoutBtn = $("drawerLogoutBtn");
    els.drawerMonitorBadge = $("drawerMonitorBadge");
    els.profileBadge = $("profileBadge");

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

  function renderUserSearchResults() {
    if (!els.userSearchResults || !els.searchResultCount) return;

    const query = normalizeText(
      els.userSearchInputHome?.value || els.userSearchInputDrawer?.value || ""
    );

    state.searchQuery = query;

    if (els.userSearchInputHome && els.userSearchInputHome.value !== query) {
      els.userSearchInputHome.value = query;
    }

    if (els.userSearchInputDrawer && els.userSearchInputDrawer.value !== query) {
      els.userSearchInputDrawer.value = query;
    }

    els.userSearchResults.innerHTML = "";

    if (!query) {
      els.searchResultCount.textContent = "0";
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
      return (
        name.includes(q) ||
        profileName.includes(q) ||
        bio.includes(q) ||
        nationality.includes(q)
      );
    });

    els.searchResultCount.textContent = String(results.length);

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
      item.addEventListener("click", () => openAccountProfileById(acc.id));

      els.userSearchResults.appendChild(item);
    });
  }

  function handleAppTitleRefresh() {
    softRefresh();
  }

  function getThreadMessagesForPeer(peerId) {
    const current = getCurrentAccount();
    if (!current || !peerId) return [];

    const thread = getThread(current.id, peerId, false);
    return Array.isArray(thread?.messages) ? thread.messages : [];
  }

  function openAccountProfileById(userId) {
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

  function renderPrivateChatHelpers() {
    renderPrivateDrawerChatsList();
    renderPrivateConversation();
  }

  function bindLowLevelAliases() {
    window.KAREEM3 = {
      refresh: softRefresh,
      logout: logoutCurrentAccount,
      openProfile,
      openUserProfileById,
      openAccountProfileById,
      openPrivateChat,
      openPrivateDrawer,
      closePrivateDrawer,
      openMenuDrawer,
      closeMenuDrawer,
      state: () => ({
        currentAccount: getCurrentAccount(),
        currentSession: getCurrentSession(),
        unreadNotifications: getUnreadNotificationCount(),
        view: state.view,
        privateDrawerOpen: state.privateDrawerOpen,
        menuOpen: state.menuOpen,
      }),
    };
  }

  document.addEventListener("DOMContentLoaded", async () => {
    await init();
    bindLowLevelAliases();
  });
})();
