import { initializeApp } from "https://www.gstatic.com/firebasejs/12.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCG2tZ86jmtuc_smyyJE4a0mx7V5kgU6Xc",
  authDomain: "shatnar-f2081.firebaseapp.com",
  projectId: "shatnar-f2081",
  storageBucket: "shatnar-f2081.firebasestorage.app",
  messagingSenderId: "237897103941",
  appId: "1:237897103941:web:989dcd6cae6bc7e84d012c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const messagesRef = collection(db, "messages");

const messagesBox = document.getElementById("messages");
const form = document.getElementById("form");
const input = document.getElementById("input");

// 🔥 عرض مباشر من Firebase
onSnapshot(query(messagesRef, orderBy("createdAt")), (snapshot) => {
  messagesBox.innerHTML = "";

  snapshot.forEach((doc) => {
    const data = doc.data();

    const div = document.createElement("div");
    div.className = "msg";

    div.textContent = data.text;

    messagesBox.appendChild(div);
  });

  messagesBox.scrollTop = messagesBox.scrollHeight;
});

// 💬 إرسال رسالة لـ Firestore
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const text = input.value.trim();
  if (!text) return;

  await addDoc(messagesRef, {
    text: text,
    createdAt: serverTimestamp()
  });

  input.value = "";
});
