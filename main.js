const STORAGE_KEY = "kareem1_messages_v5";

const ui = {
  sidebar: document.getElementById("sidebar"),
  overlay: document.getElementById("overlay"),
  openSidebarBtn: document.getElementById("openSidebarBtn"),
  closeSidebarBtn: document.getElementById("closeSidebarBtn"),
  scrollTopBtn: document.getElementById("scrollTopBtn"),
  goToChatBtn: document.getElementById("goToChatBtn"),
  goToSearchBtn: document.getElementById("goToSearchBtn"),
  goToToolsBtn: document.getElementById("goToToolsBtn"),
  chatShell: document.getElementById("chatShell"),
  msgForm: document.getElementById("msgForm"),
  msgInput: document.getElementById("msgInput"),
  messagesBox: document.getElementById("messages"),
  searchInput: document.getElementById("searchInput"),
  topbarSearch: document.getElementById("searchInput"),
  searchResults: document.getElementById("searchResults"),
  searchCountBadge: document.getElementById("searchCountBadge"),
  totalCountText: document.getElementById("totalCountText"),
  chatCountText: document.getElementById("chatCountText"),
  statMessages: document.getElementById("statMessages"),
  clearBtn: document.getElementById("clearBtn"),
  copyLastBtn: document.getElementById("copyLastBtn"),
  tabButtons: [...document.querySelectorAll(".tab-btn")],
  panels: {
    chats: document.getElementById("panel-chats"),
    search: document.getElementById("panel-search"),
    tools: document.getElementById("panel-tools")
  }
};

const state = {
  query: "",
  messages: loadMessages()
};

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.map(normalizeMessage);
  } catch {
    return [];
  }
}

function saveMessages() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.messages));
  } catch {}
}

function normalizeMessage(message) {
  const now = Date.now();
  return {
    id: message?.id || cryptoSafeId(),
    author: String(message?.author || "أنت"),
    text: String(message?.text || ""),
    time: String(message?.time || formatTime(now)),
    ts: Number(message?.ts || now),
    mine: Boolean(message?.mine ?? true)
  };
}

function cryptoSafeId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `m_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function formatTime(value) {
  try {
    return new Date(value).toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function filteredMessages() {
  const q = state.query.trim().toLowerCase();
  if (!q) return [...state.messages].sort((a, b) => a.ts - b.ts);
  return state.messages
    .filter((m) => {
      const hay = `${m.author} ${m.text} ${m.time}`.toLowerCase();
      return hay.includes(q);
    })
    .sort((a, b) => a.ts - b.ts);
}

function renderMessages() {
  const messages = filteredMessages();
  ui.messagesBox.innerHTML = "";

  if (!messages.length) {
    ui.messagesBox.innerHTML = `
      <div class="system-message">
        لا توجد رسائل. اكتب أول رسالة من الأسفل.
      </div>
    `;
  } else {
    for (const message of messages) {
      const div = document.createElement("div");
      div.className = `msg${message.mine ? " me" : ""}`;
      div.innerHTML = `
        <small>${escapeHtml(message.author)} • ${escapeHtml(message.time)}</small>
        <div>${escapeHtml(message.text)}</div>
      `;
      ui.messagesBox.appendChild(div);
    }
  }

  ui.messagesBox.scrollTop = ui.messagesBox.scrollHeight;
  updateCounts();
  renderSearchResults();
}

function updateCounts() {
  const total = state.messages.length;
  ui.totalCountText.textContent = String(total);
  ui.chatCountText.textContent = `${total} رسالة`;
  ui.statMessages.textContent = String(total);
}

function renderSearchResults() {
  const q = state.query.trim().toLowerCase();
  const results = q
    ? state.messages.filter((m) => `${m.author} ${m.text} ${m.time}`.toLowerCase().includes(q))
    : [];

  ui.searchCountBadge.textContent = String(results.length);

  if (!q) {
    ui.searchResults.innerHTML = `
      <div class="empty-state">اكتب في مربع البحث.</div>
    `;
    return;
  }

  if (!results.length) {
    ui.searchResults.innerHTML = `
      <div class="empty-state">لا توجد نتائج.</div>
    `;
    return;
  }

  ui.searchResults.innerHTML = results.slice().reverse().map((m) => `
    <div class="mini-action">
      <div>
        <strong>${escapeHtml(m.author)}</strong>
        <span>${escapeHtml(m.text)}</span>
      </div>
      <span class="mini-pill">${escapeHtml(m.time)}</span>
    </div>
  `).join("");
}

function setTab(tabName) {
  Object.entries(ui.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });

  ui.tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName);
  });
}

function openSidebar() {
  ui.sidebar.classList.add("open");
  ui.overlay.classList.add("show");
}

function closeSidebar() {
  ui.sidebar.classList.remove("open");
  ui.overlay.classList.remove("show");
}

function scrollToChat() {
  ui.chatShell.scrollIntoView({ behavior: "smooth", block: "start" });
}

function addMessage(text) {
  const message = normalizeMessage({
    author: "أنت",
    text,
    mine: true
  });

  state.messages.push(message);
  saveMessages();
  renderMessages();
}

function clearMessages() {
  const ok = confirm("مسح كل الرسائل من هذا الجهاز؟");
  if (!ok) return;
  state.messages = [];
  saveMessages();
  renderMessages();
}

async function copyLastMessage() {
  const last = state.messages[state.messages.length - 1];
  if (!last) return;
  try {
    await navigator.clipboard.writeText(last.text);
  } catch {
    const temp = document.createElement("textarea");
    temp.value = last.text;
    document.body.appendChild(temp);
    temp.select();
    document.execCommand("copy");
    temp.remove();
  }
}

function bindEvents() {
  ui.openSidebarBtn?.addEventListener("click", openSidebar);
  ui.closeSidebarBtn?.addEventListener("click", closeSidebar);
  ui.overlay?.addEventListener("click", closeSidebar);

  ui.scrollTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  ui.goToChatBtn?.addEventListener("click", scrollToChat);
  ui.goToSearchBtn?.addEventListener("click", () => setTab("search"));
  ui.goToToolsBtn?.addEventListener("click", () => setTab("tools"));

  ui.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  ui.searchInput?.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderMessages();
  });

  ui.msgForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = ui.msgInput.value.trim();
    if (!text) return;
    addMessage(text);
    ui.msgInput.value = "";
  });

  ui.clearBtn?.addEventListener("click", clearMessages);
  ui.copyLastBtn?.addEventListener("click", copyLastMessage);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}

window.KAREEM1_CHAT = {
  getMessages: () => [...state.messages],
  setQuery: (query) => {
    state.query = String(query || "");
    ui.searchInput.value = state.query;
    renderMessages();
  },
  addMessage: (text) => addMessage(String(text || "")),
  clearMessages: () => clearMessages()
};

bindEvents();
renderMessages();

if (window.lucide) {
  window.lucide.createIcons();
}
