import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  getDocs,
  writeBatch
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCG2tZ86jmtuc_smyyJE4a0mx7V5kgU6Xc",
  authDomain: "shatnar-f2081.firebaseapp.com",
  projectId: "shatnar-f2081",
  storageBucket: "shatnar-f2081.firebasestorage.app",
  messagingSenderId: "237897103941",
  appId: "1:237897103941:web:989dcd6cae6bc7e84d012c",
  measurementId: "G-HVNTN7FGH4"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const messagesRef = collection(db, "messages");

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
  messages: []
};

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

function normalizeMessage(message = {}) {
  const now = Date.now();
  const ts = Number(message.ts ?? now);

  return {
    id: message.id || cryptoSafeId(),
    author: String(message.author || "أنت"),
    text: String(message.text || ""),
    time: String(message.time || formatTime(ts)),
    ts: Number.isFinite(ts) ? ts : now,
    mine: Boolean(message.mine ?? true)
  };
}

function filteredMessages() {
  const q = state.query.trim().toLowerCase();

  const items = [...state.messages].sort((a, b) => a.ts - b.ts);

  if (!q) return items;

  return items.filter((m) => {
    const hay = `${m.author} ${m.text} ${m.time}`.toLowerCase();
    return hay.includes(q);
  });
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
    ? state.messages.filter((m) => {
        const hay = `${m.author} ${m.text} ${m.time}`.toLowerCase();
        return hay.includes(q);
      })
    : [];

  ui.searchCountBadge.textContent = String(results.length);

  if (!q) {
    ui.searchResults.innerHTML = `<div class="empty-state">اكتب في مربع البحث.</div>`;
    return;
  }

  if (!results.length) {
    ui.searchResults.innerHTML = `<div class="empty-state">لا توجد نتائج.</div>`;
    return;
  }

  ui.searchResults.innerHTML = results
    .slice()
    .reverse()
    .map(
      (m) => `
        <div class="mini-action">
          <div>
            <strong>${escapeHtml(m.author)}</strong>
            <span>${escapeHtml(m.text)}</span>
          </div>
          <span class="mini-pill">${escapeHtml(m.time)}</span>
        </div>
      `
    )
    .join("");
}

function renderMessages() {
  const messages = filteredMessages();
  ui.messagesBox.innerHTML = "";

  if (!messages.length) {
    ui.messagesBox.innerHTML = `
      <div class="system-message">اكتب أول رسالة من الأسفل.</div>
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

  if (window.lucide?.createIcons) {
    window.lucide.createIcons();
  }
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

async function addMessage(text) {
  const cleanText = String(text || "").trim();
  if (!cleanText) return;

  await addDoc(messagesRef, {
    author: "أنت",
    text: cleanText,
    ts: Date.now(),
    createdAt: serverTimestamp()
  });
}

async function clearMessages() {
  const ok = confirm("مسح كل الرسائل من قاعدة البيانات؟");
  if (!ok) return;

  const snapshot = await getDocs(messagesRef);
  if (snapshot.empty) return;

  const batch = writeBatch(db);
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();
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

  ui.msgForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = ui.msgInput.value.trim();
    if (!text) return;

    await addMessage(text);
    ui.msgInput.value = "";
    ui.msgInput.focus();
  });

  ui.clearBtn?.addEventListener("click", async () => {
    try {
      await clearMessages();
    } catch (error) {
      console.error("Clear messages error:", error);
      alert("تعذر مسح الرسائل. راجع Firestore rules.");
    }
  });

  ui.copyLastBtn?.addEventListener("click", copyLastMessage);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSidebar();
  });
}

window.KAREEM1_CHAT = {
  getMessages: () => [...state.messages],
  setQuery: (queryText) => {
    state.query = String(queryText || "");
    if (ui.searchInput) ui.searchInput.value = state.query;
    renderMessages();
  },
  addMessage: async (text) => addMessage(String(text || "")),
  clearMessages: async () => clearMessages()
};

const q = query(messagesRef, orderBy("ts", "asc"));

onSnapshot(
  q,
  (snapshot) => {
    state.messages = snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      const ts = Number(data.ts ?? Date.now());

      return normalizeMessage({
        id: docSnap.id,
        author: data.author,
        text: data.text,
        time: data.time,
        ts: Number.isFinite(ts) ? ts : Date.now(),
        mine: true
      });
    });

    renderMessages();
  },
  (error) => {
    console.error("Firestore listener error:", error);
    ui.messagesBox.innerHTML = `
      <div class="system-message">تعذر الاتصال بقاعدة البيانات. راجع Firestore rules أو الاتصال.</div>
    `;
  }
);

bindEvents();
renderMessages();
