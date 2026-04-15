import { db, collection, addDoc, onSnapshot, query, orderBy } from "./firebase.js";

let username = "زائر";

// عناصر الصفحة
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const form = document.getElementById("msgForm");

// إرسال رسالة
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = msgInput.value.trim();
  if (!text) return;

  await addDoc(collection(db, "messages"), {
    message: text,
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
      <small>${m.username}</small>
      <div>${m.message}</div>
    `;

    msgBox.appendChild(div);
  });

  msgBox.scrollTop = msgBox.scrollHeight;
});
