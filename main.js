// استيراد قاعدة البيانات من firebase.js
import { db } from './firebase.js';

import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

// اسم المستخدم (مؤقت)
let username = "زائر";

// عناصر الصفحة
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const form = document.getElementById("msgForm");

// إرسال رسالة
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (!msgInput.value.trim()) return;

  await addDoc(collection(db, "messages"), {
    message: msgInput.value,
    username: username,
    timestamp: Date.now()
  });

  msgInput.value = "";
});

// استقبال الرسائل (Realtime)
const q = query(collection(db, "messages"), orderBy("timestamp"));

onSnapshot(q, (snapshot) => {
  msgBox.innerHTML = "";

  snapshot.forEach(doc => {
    const m = doc.data();

    const div = document.createElement("div");
    div.className = "msg";

    div.innerHTML = `
      <div style="color:#888;font-size:12px">${m.username}</div>
      <div>${m.message}</div>
    `;

    msgBox.appendChild(div);
  });

  msgBox.scrollTop = msgBox.scrollHeight;
});
