/* =========================
   KAREEM CHAT MAIN.JS
   FULL WORKING CORE
========================= */

const state = {
  view: "home",
  currentUser: null,
  activePrivateUser: null,
  messages: [],
  privateChats: {},
  users: [],
  featuredUsers: []
};

/* =========================
   ELEMENTS CACHE
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
   CACHE ELEMENTS
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

  els.onlineList = $("onlineUsersList");
  els.featuredList = $("featuredUsersList");

  els.drawerLogoutBtn = $("drawerLogoutBtn");

  els.profileForm = $("profileForm");
  els.profileName = $("profileName");
  els.profilePassword = $("profilePassword");
  els.profileAge = $("profileAge");
  els.profileGender = $("profileGender");
  els.profileNationality = $("profileNationality");
  els.profileBio = $("profileBio");

  els.profileAvatar = $("profileAvatarPreview");
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
  });

  $("backFromProfileBtn")?.addEventListener("click", () => {
    setView("home");
  });

  $("backFromPrivateBtn")?.addEventListener("click", () => setView("home"));

  els.publicForm?.addEventListener("submit", sendPublicMessage);

  els.privateForm?.addEventListener("submit", sendPrivateMessage);

  els.profileForm?.addEventListener("submit", saveProfile);

  $("closeProfileBtn")?.addEventListener("click", () => setView("home"));

  els.drawerLogoutBtn?.addEventListener("click", logout);
}

/* =========================
   VIEW SYSTEM
========================= */
function setView(view) {
  state.view = view;
  els.app.dataset.view = view;

  // اخفاء كل الصفحات
  document.getElementById("homeView")?.classList.add("is-hidden");
  document.getElementById("profileView")?.classList.add("is-hidden");
  document.getElementById("privateView")?.classList.add("is-hidden");

  // إظهار المطلوب
  if (view === "home") {
    document.getElementById("homeView")?.classList.remove("is-hidden");
  }

  if (view === "profile") {
    document.getElementById("profileView")?.classList.remove("is-hidden");
  }

  if (view === "private") {
    document.getElementById("privateView")?.classList.remove("is-hidden");
  }
}

/* =========================
   MENU
========================= */
function toggleMenu() {
  els.menuDrawer.classList.toggle("is-hidden");
}

/* =========================
   DATA STORAGE
========================= */
function loadData() {
  state.messages = JSON.parse(localStorage.getItem("publicMessages") || "[]");
  state.privateChats = JSON.parse(localStorage.getItem("privateChats") || "{}");

  state.users = JSON.parse(localStorage.getItem("users") || "[]");

  if (!state.currentUser) {
    state.currentUser = {
      id: Date.now(),
      name: "زائر",
      bio: "",
      online: true
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

  const msg = {
    id: Date.now(),
    text,
    user: state.currentUser.name,
    time: new Date().toLocaleTimeString()
  };

  state.messages.push(msg);

  if (state.messages.length > 70) {
    state.messages.shift();
  }

  els.publicInput.value = "";

  saveData();
  renderPublicMessages();
}

function renderPublicMessages() {
  els.publicMessages.innerHTML = "";

  if (!state.messages.length) {
    els.publicMessages.innerHTML = `<div class="messages-placeholder">لسه ما فيش رسائل ظاهرة هنا.</div>`;
    return;
  }

  state.messages.forEach(m => {
    const div = document.createElement("div");
    div.className = "message-item";

    div.innerHTML = `
      <div class="message-head">
        <div class="message-avatar">${m.user[0]}</div>
        <div class="message-meta-wrap">
          <button class="message-sender">${m.user}</button>
          <span class="message-time">${m.time}</span>
        </div>
      </div>
      <p class="message-text">${m.text}</p>
    `;

    els.publicMessages.appendChild(div);
  });

  els.publicMessages.scrollTop = els.publicMessages.scrollHeight;
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
    time: new Date().toLocaleTimeString(),
    from: state.currentUser.name
  });

  els.privateInput.value = "";

  saveData();
  renderPrivateMessages();
}

function renderPrivateMessages() {
  const uid = state.activePrivateUser?.id;
  els.privateMessages.innerHTML = "";

  if (!uid || !state.privateChats[uid]) {
    els.privateMessages.innerHTML = `<div class="messages-placeholder">اختار محادثة عشان تبدأ.</div>`;
    return;
  }

  state.privateChats[uid].forEach(m => {
    const div = document.createElement("div");
    div.className = "message-item is-own";

    div.innerHTML = `
      <div class="message-head">
        <div class="message-avatar">${m.from[0]}</div>
        <div class="message-meta-wrap">
          <span class="message-sender">${m.from}</span>
          <span class="message-time">${m.time}</span>
        </div>
      </div>
      <p class="message-text">${m.text}</p>
    `;

    els.privateMessages.appendChild(div);
  });

  els.privateMessages.scrollTop = els.privateMessages.scrollHeight;
}

/* =========================
   USERS
========================= */
function renderUsers() {
  els.onlineList.innerHTML = "";

  state.users.forEach(u => {
    const div = document.createElement("div");
    div.className = "user-row";

    div.innerHTML = `
      <div class="avatar">${u.name[0]}</div>
      <div class="user-row-info">
        <strong>${u.name}</strong>
        <span>${u.bio || "بدون وصف"}</span>
      </div>
      <div class="online-badge">●</div>
    `;

    els.onlineList.appendChild(div);
  });
}

/* =========================
   PROFILE
========================= */
function saveProfile(e) {
  e.preventDefault();

  state.currentUser = {
    ...state.currentUser,
    name: els.profileName.value,
    password: els.profilePassword.value,
    age: els.profileAge.value,
    gender: els.profileGender.value,
    nationality: els.profileNationality.value,
    bio: els.profileBio.value
  };

  localStorage.setItem("currentUser", JSON.stringify(state.currentUser));

  alert("تم حفظ الملف");
  renderUsers();
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
  renderUsers();
}
