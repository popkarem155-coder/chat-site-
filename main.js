let username = "زائر";

// عناصر الصفحة
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const form = document.getElementById("msgForm");

const STORAGE_KEY = "kareem1_messages";

// تحميل الرسائل من المتصفح
let messages = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// عرض الرسائل
function renderMessages() {
  msgBox.innerHTML = "";

  messages.forEach((m) => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `
      <small>${m.username} • ${m.time}</small>
      <div>${m.message}</div>
    `;
    msgBox.appendChild(div);
  });

  msgBox.scrollTop = msgBox.scrollHeight;
}

// حفظ الرسائل
function saveMessages() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
}

// إرسال رسالة
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = msgInput.value.trim();
  if (!text) return;

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

  msgInput.value = "";
});

// أول تحميل
renderMessages();
