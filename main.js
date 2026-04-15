const STORAGE_KEY = "kareem1_messages";
const username = "زائر";

let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const openSidebarBtn = document.getElementById("openSidebarBtn");
const closeSidebarBtn = document.getElementById("closeSidebarBtn");
const searchInput = document.getElementById("searchInput");
const topSearch = document.getElementById("topSearch");
const memberSearch = document.getElementById("memberSearch");
const tabButtons = document.querySelectorAll(".tab-btn");
const panels = {
  chats: document.getElementById("panel-chats"),
  private: document.getElementById("panel-private"),
  alerts: document.getElementById("panel-alerts")
};

const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const form = document.getElementById("msgForm");

function escapeHtml(text = "") {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

function renderMessages() {
  msgBox.innerHTML = "";

  if (!messages.length) {
    msgBox.innerHTML = `
      <div class="system-message">
        لا توجد رسائل بعد. اكتب أول رسالة من الأسفل.
      </div>
    `;
    return;
  }

  messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `
      <small>${escapeHtml(m.username)} • ${escapeHtml(m.time)}</small>
      <div>${escapeHtml(m.message)}</div>
    `;
    msgBox.appendChild(div);
  });

  msgBox.scrollTop = msgBox.scrollHeight;
}

function sendMessage(text) {
  const msg = {
    username,
    message: text,
    time: new Date().toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  messages.push(msg);
  saveMessages();
  renderMessages();
}

function setPanel(panelName) {
  Object.entries(panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === panelName);
  });

  tabButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.tab === panelName);
  });
}

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

function filterItems(value) {
  const q = value.trim().toLowerCase();

  document.querySelectorAll(".chat-item").forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(q) ? "" : "none";
  });
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = msgInput.value.trim();
  if (!text) return;

  sendMessage(text);
  msgInput.value = "";
});

openSidebarBtn?.addEventListener("click", openSidebar);
closeSidebarBtn?.addEventListener("click", closeSidebar);
overlay?.addEventListener("click", closeSidebar);

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => setPanel(btn.dataset.tab));
});

searchInput?.addEventListener("input", (e) => filterItems(e.target.value));
topSearch?.addEventListener("input", (e) => {
  searchInput.value = e.target.value;
  memberSearch.value = e.target.value;
  filterItems(e.target.value);
});
memberSearch?.addEventListener("input", (e) => {
  searchInput.value = e.target.value;
  topSearch.value = e.target.value;
  filterItems(e.target.value);
});

document.getElementById("goToChatBtn")?.addEventListener("click", () => {
  document.getElementById("chatShell").scrollIntoView({ behavior: "smooth", block: "start" });
});
document.getElementById("goToAlertsBtn")?.addEventListener("click", () => setPanel("alerts"));
document.getElementById("goToPrivateBtn")?.addEventListener("click", () => setPanel("private"));
document.getElementById("scrollTopBtn")?.addEventListener("click", () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
});

renderMessages();
if (window.lucide) {
  window.lucide.createIcons();
}
