// ===============================
// K3-Z | main.js
// الإصدار الجديد - K3-Z
// ===============================

(function () {
  "use strict";

  const STORAGE_KEY = "K3Z_MAIN_UI_STATE";

  const DEFAULT_DATA = {
    user: {
      name: "K3-Z User",
      initial: "K",
      subtitle: "الملف الشخصي"
    },
    notifications: 0,
    visitedCount: 0,
    onlineUsers: [
      { id: 1, name: "Ahmed", status: "متصل الآن" }
    ],
    featuredUsers: [
      { id: 1, name: "Nour", score: 92 },
      { id: 2, name: "Omar", score: 86 }
    ],
    privateChats: [
      { id: 1, name: "أحمد", lastMessage: "آخر رسالة", time: "منذ قليل" }
    ],
    messages: [
      {
        id: 1,
        sender: "K3-Z",
        text: "أهلاً بك في شات نار.",
        time: "الآن",
        mine: false
      }
    ]
  };

  let state = loadState();
  let drawerOpen = false;
  let leftDrawerOpen = false;
  const refs = {};

  function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function normalizeState(input) {
    const safe = input && typeof input === "object" ? input : {};

    return {
      user: {
        name: safe.user?.name || DEFAULT_DATA.user.name,
        initial: safe.user?.initial || DEFAULT_DATA.user.initial,
        subtitle: safe.user?.subtitle || DEFAULT_DATA.user.subtitle
      },
      notifications: Number.isFinite(Number(safe.notifications))
        ? Number(safe.notifications)
        : 0,
      visitedCount: Number.isFinite(Number(safe.visitedCount))
        ? Number(safe.visitedCount)
        : 0,
      onlineUsers: Array.isArray(safe.onlineUsers)
        ? safe.onlineUsers
        : deepClone(DEFAULT_DATA.onlineUsers),
      featuredUsers: Array.isArray(safe.featuredUsers)
        ? safe.featuredUsers
        : deepClone(DEFAULT_DATA.featuredUsers),
      privateChats: Array.isArray(safe.privateChats)
        ? safe.privateChats
        : deepClone(DEFAULT_DATA.privateChats),
      messages: Array.isArray(safe.messages)
        ? safe.messages
        : deepClone(DEFAULT_DATA.messages)
    };
  }

  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return normalizeState(JSON.parse(saved));
    } catch (err) {
      console.warn("Failed to load K3-Z UI state:", err);
    }
    return normalizeState(DEFAULT_DATA);
  }

  function saveState(nextState) {
    state = normalizeState(nextState);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (err) {
      console.warn("Failed to save K3-Z UI state:", err);
    }

    syncExternalSystems();
    renderAll();
  }

  function patchState(partial) {
    const next = normalizeState({
      ...state,
      ...(partial && typeof partial === "object" ? partial : {})
    });
    saveState(next);
    return next;
  }

  function syncExternalSystems() {
    const snapshot = getState();

    try {
      if (window.K3_HEALTH && typeof window.K3_HEALTH === "object") {
        window.K3_HEALTH.main = true;
      }
      if (window.K3_HEALTH_API && typeof window.K3_HEALTH_API.mark === "function") {
        window.K3_HEALTH_API.mark("main");
      }
    } catch (_) {}

    try {
      if (window.K3_STATE && typeof window.K3_STATE.update === "function") {
        window.K3_STATE.update({
          notifications_count: snapshot.notifications,
          users_online: snapshot.onlineUsers.length,
          ui_state: drawerOpen ? "right_drawer_open" : "home_chat",
          last_update: Date.now()
        });
      }
    } catch (_) {}

    try {
      if (window.K3Z_STATE && typeof window.K3Z_STATE.update === "function") {
        window.K3Z_STATE.update({
          notifications_count: snapshot.notifications,
          users_online: snapshot.onlineUsers.length,
          ui_state: drawerOpen ? "right_drawer_open" : "home_chat",
          last_update: Date.now()
        });
      }
    } catch (_) {}
  }

  function cacheRefs() {
    refs.menuBtn = document.getElementById("menuBtn");
    refs.privateChatBtn = document.getElementById("privateChatBtn");
    refs.rightDrawer = document.getElementById("rightDrawer");
    refs.leftDrawer = document.getElementById("leftDrawer");
    refs.drawerOverlay = document.getElementById("drawerOverlay");

    refs.searchInput = document.getElementById("searchInput");
    refs.privateSearchInput = document.getElementById("privateSearchInput");

    refs.onlineUsersList = document.getElementById("onlineUsersList");
    refs.featuredUsersList = document.getElementById("featuredUsersList");
    refs.chatMessages = document.getElementById("chatMessages");
    refs.privateConversations = document.getElementById("privateConversations");

    refs.messageInput = document.getElementById("messageInput");
    refs.sendBtn = document.getElementById("sendBtn");

    refs.profileAvatar = document.getElementById("profileAvatar");
    refs.profileName = document.getElementById("profileName");
    refs.profileSub = document.getElementById("profileSub");
    refs.profileBadge = document.getElementById("profileBadge");

    refs.visitedMeBtn = document.getElementById("visitedMeBtn");
    refs.appSettingsBtn = document.getElementById("appSettingsBtn");
    refs.logoutBtn = document.getElementById("logoutBtn");
  }

  function bindEvents() {
    if (refs.menuBtn) {
      refs.menuBtn.addEventListener("click", () => {
        toggleRightDrawer();
      });
    }

    if (refs.privateChatBtn) {
      refs.privateChatBtn.addEventListener("click", () => {
        toggleLeftDrawer();
      });
    }

    if (refs.drawerOverlay) {
      refs.drawerOverlay.addEventListener("click", () => {
        closeRightDrawer();
        closeLeftDrawer();
      });
    }

    if (refs.searchInput) {
      refs.searchInput.addEventListener("input", renderAll);
    }

    if (refs.privateSearchInput) {
      refs.privateSearchInput.addEventListener("input", renderPrivateChats);
    }

    if (refs.sendBtn) {
      refs.sendBtn.addEventListener("click", sendMessageFromInput);
    }

    if (refs.messageInput) {
      // مهم: لا يوجد autofocus
      refs.messageInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          sendMessageFromInput();
        }
      });
    }

    if (refs.visitedMeBtn) {
      refs.visitedMeBtn.addEventListener("click", () => {
        incrementVisitedCount();
        closeRightDrawer();
      });
    }

    if (refs.appSettingsBtn) {
      refs.appSettingsBtn.addEventListener("click", () => {
        alert("إعدادات التطبيق ستُربط لاحقًا.");
      });
    }

    if (refs.logoutBtn) {
      refs.logoutBtn.addEventListener("click", () => {
        alert("تسجيل الخروج سيتم تفعيله لاحقًا.");
      });
    }

    if (window.K3_SYSTEM && typeof window.K3_SYSTEM.on === "function") {
      try {
        window.K3_SYSTEM.on("message:new", (payload) => {
          if (!payload) return;
          addIncomingMessage(payload);
        });

        window.K3_SYSTEM.on("notification:increase", () => {
          incrementNotifications();
        });

        window.K3_SYSTEM.on("profile:visited", () => {
          incrementVisitedCount();
        });
      } catch (err) {
        console.warn("K3_SYSTEM hook failed:", err);
      }
    }
  }

  function getSearchValue() {
    return (refs.searchInput?.value || "").trim().toLowerCase();
  }

  function getPrivateSearchValue() {
    return (refs.privateSearchInput?.value || "").trim().toLowerCase();
  }

  function toggleRightDrawer() {
    drawerOpen = !drawerOpen;
    if (drawerOpen) leftDrawerOpen = false;
    updateDrawerUI();
    syncExternalSystems();
  }

  function toggleLeftDrawer() {
    leftDrawerOpen = !leftDrawerOpen;
    if (leftDrawerOpen) drawerOpen = false;
    updateDrawerUI();
    syncExternalSystems();
  }

  function closeRightDrawer() {
    drawerOpen = false;
    updateDrawerUI();
    syncExternalSystems();
  }

  function closeLeftDrawer() {
    leftDrawerOpen = false;
    updateDrawerUI();
    syncExternalSystems();
  }

  function updateDrawerUI() {
    if (refs.rightDrawer) {
      refs.rightDrawer.classList.toggle("open", drawerOpen);
      refs.rightDrawer.setAttribute("aria-hidden", String(!drawerOpen));
    }

    if (refs.leftDrawer) {
      refs.leftDrawer.classList.toggle("open", leftDrawerOpen);
      refs.leftDrawer.setAttribute("aria-hidden", String(!leftDrawerOpen));
    }

    if (refs.drawerOverlay) {
      refs.drawerOverlay.classList.toggle("active", drawerOpen || leftDrawerOpen);
    }
  }

  function scrollToChat() {
    const chatPanel = document.getElementById("publicChatPanel");
    if (chatPanel && typeof chatPanel.scrollIntoView === "function") {
      chatPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    setTimeout(() => {
      if (refs.messageInput && typeof refs.messageInput.focus === "function") {
        refs.messageInput.focus();
      }
    }, 140);
  }

  function incrementNotifications() {
    state.notifications += 1;
    saveState(state);
  }

  function resetNotifications() {
    state.notifications = 0;
    saveState(state);
  }

  function incrementVisitedCount() {
    state.visitedCount += 1;
    incrementNotifications();
    saveState(state);
  }

  function addMessage(message) {
    state.messages.push(message);
    incrementNotifications();
    saveState(state);
  }

  function addIncomingMessage(payload) {
    const message = {
      id: Date.now(),
      sender: payload.sender || "مستخدم",
      text: payload.text || "",
      time: payload.time || "الآن",
      mine: false
    };

    state.messages.push(message);
    incrementNotifications();
    saveState(state);
  }

  function sendMessageFromInput() {
    if (!refs.messageInput) return;

    const text = refs.messageInput.value.trim();
    if (!text) return;

    const message = {
      id: Date.now(),
      sender: state.user.name,
      text,
      time: "الآن",
      mine: true
    };

    addMessage(message);
    refs.messageInput.value = "";

    if (window.K3_SYSTEM && typeof window.K3_SYSTEM.emit === "function") {
      try {
        window.K3_SYSTEM.emit("message:send", message);
      } catch (err) {
        console.warn("Failed to emit message:send:", err);
      }
    }

    if (window.K3_FIREBASE && typeof window.K3_FIREBASE.sendMessage === "function") {
      try {
        window.K3_FIREBASE.sendMessage(message);
      } catch (err) {
        console.warn("Firebase send failed:", err);
      }
    }
  }

  function renderProfile() {
    if (refs.profileAvatar) {
      refs.profileAvatar.textContent = state.user.initial || "K";
    }

    if (refs.profileName) {
      refs.profileName.textContent = state.user.name;
    }

    if (refs.profileSub) {
      refs.profileSub.textContent = state.user.subtitle;
    }

    if (refs.profileBadge) {
      refs.profileBadge.textContent = String(state.notifications);
      refs.profileBadge.style.opacity = state.notifications > 0 ? "1" : "0.55";
      refs.profileBadge.style.boxShadow =
        state.notifications > 0 ? "0 0 0 3px rgba(255, 46, 136, 0.15)" : "none";
    }
  }

  function renderOnlineUsers() {
    if (!refs.onlineUsersList) return;

    const q = getSearchValue();
    const items = state.onlineUsers.filter((u) => {
      const name = String(u.name || "").toLowerCase();
      const status = String(u.status || "").toLowerCase();
      return !q || name.includes(q) || status.includes(q);
    });

    refs.onlineUsersList.innerHTML = items.length
      ? items
          .map(
            (u) => `
              <div class="status-pill user-chip" data-user-id="${u.id}">
                <strong>${escapeHtml(u.name)}</strong>
                <span>${escapeHtml(u.status || "متصل الآن")}</span>
              </div>
            `
          )
          .join("")
      : `<div class="status-pill user-chip">لا توجد نتائج</div>`;
  }

  function renderFeaturedUsers() {
    if (!refs.featuredUsersList) return;

    const q = getSearchValue();
    const items = state.featuredUsers.filter((u) => {
      const name = String(u.name || "").toLowerCase();
      return !q || name.includes(q);
    });

    refs.featuredUsersList.innerHTML = items.length
      ? items
          .map(
            (u) => `
              <div class="status-pill user-chip" data-featured-id="${u.id}">
                <strong>${escapeHtml(u.name)}</strong>
                <span>النقاط: ${Number(u.score || 0)}</span>
              </div>
            `
          )
          .join("")
      : `<div class="status-pill user-chip">لا توجد نتائج</div>`;
  }

  function renderPrivateChats() {
    if (!refs.privateConversations) return;

    const q = getPrivateSearchValue();
    const items = state.privateChats.filter((c) => {
      const name = String(c.name || "").toLowerCase();
      const lastMessage = String(c.lastMessage || "").toLowerCase();
      return !q || name.includes(q) || lastMessage.includes(q);
    });

    refs.privateConversations.innerHTML = items.length
      ? items
          .slice()
          .reverse()
          .map(
            (c) => `
              <div class="private-item" data-private-id="${c.id}">
                <div class="private-avatar">${escapeHtml((c.name || "?").slice(0, 1))}</div>
                <div class="private-meta">
                  <strong>${escapeHtml(c.name || "مستخدم")}</strong>
                  <span>${escapeHtml(c.lastMessage || "لا توجد محادثة")}</span>
                </div>
                <div class="private-time">${escapeHtml(c.time || "")}</div>
              </div>
            `
          )
          .join("")
      : `<div class="private-item"><div class="private-meta"><strong>لا توجد نتائج</strong></div></div>`;
  }

  function renderMessages() {
    if (!refs.chatMessages) return;

    const q = getSearchValue();
    const items = state.messages.filter((m) => {
      const text = String(m.text || "").toLowerCase();
      const sender = String(m.sender || "").toLowerCase();
      return !q || text.includes(q) || sender.includes(q);
    });

    refs.chatMessages.innerHTML = items.length
      ? items
          .map(
            (m) => `
              <div class="message-bubble ${m.mine ? "mine" : "other"}" data-message-id="${m.id}">
                <div class="message-meta">
                  <strong>${escapeHtml(m.sender || "مستخدم")}</strong>
                  <small>${escapeHtml(m.time || "")}</small>
                </div>
                <div class="message-text">${escapeHtml(m.text || "")}</div>
              </div>
            `
          )
          .join("")
      : `<div class="message-bubble other">لا توجد نتائج</div>`;
  }

  function renderAll() {
    renderProfile();
    renderOnlineUsers();
    renderFeaturedUsers();
    renderPrivateChats();
    renderMessages();
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function bootstrap() {
    cacheRefs();
    bindEvents();
    updateDrawerUI();
    renderAll();
    syncExternalSystems();

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  document.addEventListener("DOMContentLoaded", bootstrap);

  window.K3Z_MAIN = {
    getState: () => deepClone(state),
    saveState,
    patchState,
    openRightDrawer: () => {
      drawerOpen = true;
      leftDrawerOpen = false;
      updateDrawerUI();
      syncExternalSystems();
    },
    closeRightDrawer,
    toggleRightDrawer,
    openLeftDrawer: () => {
      leftDrawerOpen = true;
      drawerOpen = false;
      updateDrawerUI();
      syncExternalSystems();
    },
    closeLeftDrawer,
    toggleLeftDrawer,
    incrementNotifications,
    resetNotifications,
    addMessage,
    addIncomingMessage
  };
})();
