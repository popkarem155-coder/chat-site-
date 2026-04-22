/* =========================
   KAREEM CHAT MAIN.JS (FIXED)
========================= */

const state = {
  view: "home",
  currentUser: null,
  activePrivateUser: null,
  messages: [],
  privateChats: {},
  users: []
};

/* =========================
   ELEMENTS
========================= */
const $ = (id) => document.getElementById(id);

const els = {};

/* =========================
   INIT
========================= */
document.addEventListener("DOMContentLoaded", () => {
  cache();
  bindEvents();
  loadData();
  renderAll();
  setView("home");
});

/* =========================
   CACHE
========================= */
function cache() {
  els.app = $("app");

  els.menuBtn = $("menuBtn");
  els.menuDrawer = $("menuDrawer");

  els.publicForm = $("publicMessageForm");
  els.publicInput = $("publicMessageInput");
  els.publicMessages = $("publicMessages");

  els.privateForm = $("privateMessageForm");
  els.privateInput = $("privateMessageInput");
  els.privateMessages = $("privateMessages");

  els.profileForm = $("profileForm");
  els.profileName = $("profileName");
  els.profilePassword = $("profilePassword");
  els.profileAge = $("profileAge");
  els.profileGender = $("profileGender");
  els.profileNationality = $("profileNationality");
  els.profileBio = $("profileBio");

  els.drawerLogoutBtn = $("drawerLogoutBtn");
}

/* =========================
   EVENTS
========================= */
function bindEvents() {
  $("appTitleBtn").onclick = () => setView("home");

  $("privateShortcutBtn").onclick = () => setView("private");

  $("menuBtn").onclick = toggleMenu;

  $("drawerProfileBtn")?.addEventListener("click", () => {
    setView("profile");
    toggleMenu();
  });

  $("openMyProfileFromMenu")?.addEventListener("click", () => {
    setView("profile");
    toggleMenu();
  });

  $("backFromProfileBtn")?.addEventListener("click", () => setView("home"));

  $("backFromPrivateBtn")?.addEventListener("click", () => setView("home"));

  $("backFromUserViewBtn")?.addEventListener("click", () => setView("home"));

  $("closeProfileBtn")?.addEventListener("click", () => setView("home"));

  els.publicForm?.addEventListener("submit", sendPublicMessage);
  els.privateForm?.addEventListener("submit", sendPrivateMessage);
  els.profileForm?.addEventListener("submit", saveProfile);

  els.drawerLogoutBtn?.addEventListener("click", logout);
}

/* =========================
   VIEW SYSTEM (FIXED)
========================= */
function setView(view) {
  state.view = view;
  els.app.dataset.view = view;

  // اخفاء كل الشاشات
  const pages = [
    "homeView",
    "profileView",
    "privateView",
    "userView"
  ];

  pages.forEach(id => {
    document.getElementById(id)?.classList.add("is-hidden");
  });

  // إظهار المطلوب
  document.getElementById(view + "View")?.classList.remove("is-hidden");
}

/* =========================
   MENU
========================= */
function toggleMenu() {
  els.menuDrawer.classList.toggle("is-hidden");
}

/* =========================
   DATA
========================= */
function loadData() {
  state.messages = JSON.parse(localStorage.getItem("publicMessages") || "[]");
  state.privateChats = JSON.parse(localStorage.getItem("privateChats") || "{}");

  state.users = JSON.parse(localStorage.getItem("users") || "[]");

  if (!state.currentUser) {
    state.currentUser = {
      id: Date.now(),
      name: "زائر"
    };
  }
}

function saveData() {
  localStorage.setItem("publicMessages", JSON.stringify(state.messages));
  localStorage.setItem("privateChats", JSON.stringify(state.privateChats));
  localStorage.setItem("users", JSON.stringify(state.users));
}

/* =========================
   PUBLIC CHAT
========================= */
function sendPublicMessage(e) {
  e.preventDefault();

  const text = els.publicInput.value.trim();
  if (!text) return;

  state.messages.push({
    id: Date.now(),
    text,
    user: state.currentUser.name,
    time: new Date().toLocaleTimeString()
  });

  if (state.messages.length > 70) state.messages.shift();

  els.publicInput.value = "";

  saveData();
  renderPublicMessages();
}

function renderPublicMessages() {
  els.publicMessages.innerHTML = "";

  if (!state.messages.length) {
    els.publicMessages.innerHTML =
      `<div class="messages-placeholder">لسه ما فيش رسائل</div>`;
    return;
  }

  state.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message-item";

    div.innerHTML = `
      <strong>${m.user}</strong>
      <p>${m.text}</p>
      <small>${m.time}</small>
    `;

    els.publicMessages.appendChild(div);
  });
}

/* =========================
   PRIVATE CHAT
========================= */
function sendPrivateMessage(e) {
  e.preventDefault();

  if (!state.activePrivateUser) return;

  const text = els.privateInput.value.trim();
  if (!text) return;

  const uid = state.activePrivateUser.id;

  if (!state.privateChats[uid]) {
    state.privateChats[uid] = [];
  }

  state.privateChats[uid].push({
    text,
    from: state.currentUser.name,
    time: new Date().toLocaleTimeString()
  });

  els.privateInput.value = "";

  saveData();
}

/* =========================
   PROFILE
========================= */
function saveProfile(e) {
  e.preventDefault();

  state.currentUser = {
    ...state.currentUser,
    name: els.profileName.value
  };

  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));

  alert("تم الحفظ");
}

/* =========================
   LOGOUT
========================= */
function logout() {
  localStorage.clear();
  location.reload();
}

/* =========================
   RENDER ALL
========================= */
function renderAll() {
  renderPublicMessages();
}
