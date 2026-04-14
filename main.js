import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

/* ================= FIREBASE CONFIG ================= */
const firebaseConfig = {
  apiKey: "AIzaSyCNCq5bP_UVdQgXPr40lroIkiti5aMWyvw",
  authDomain: "chat-nar.firebaseapp.com",
  projectId: "chat-nar",
  storageBucket: "chat-nar.firebasestorage.app",
  messagingSenderId: "199917444253",
  appId: "1:199917444253:web:aef64b8f6cb812d8f2c874",
  measurementId: "G-B8LJJ7XJ7W"
};

/* ================= INIT ================= */
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ================= USER ================= */
let username = "زائر";

/* ================= DOM ================= */
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const msgForm = document.getElementById("msgForm");

/* ================= SEND MESSAGE ================= */
msgForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = msgInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    message: text,
    username,
    timestamp: Date.now()
  });

  msgInput.value = "";
});

/* ================= REALTIME CHAT ================= */
const q = query(collection(db, "messages"), orderBy("timestamp"));

onSnapshot(q, (snapshot) => {
  msgBox.innerHTML = "";

  snapshot.forEach(doc => {
    const m = doc.data();

    const div = document.createElement("div");
    div.className = "msg";

    div.innerHTML = `
      <small>${m.username}</small>
      <div>${m.message}</div>
    `;

    msgBox.appendChild(div);
  });

  msgBox.scrollTop = msgBox.scrollHeight;
});

/* ================= OPTIONAL ================= */
window.setUsername = (name) => {
  username = name;
};
