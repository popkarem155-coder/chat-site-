// وضع تجريبي بدون Firebase

let username = "زائر";

// عناصر الصفحة
const msgInput = document.getElementById("msgInput");
const msgBox = document.getElementById("messages");
const form = document.getElementById("msgForm");

// مصفوفة مؤقتة للرسائل
let messages = [];

// إرسال رسالة
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const text = msgInput.value.trim();
  if (!text) return;

  const msg = {
    username: username,
    message: text,
    time: new Date().toLocaleTimeString("ar", {
      hour: "2-digit",
      minute: "2-digit"
    })
  };

  messages.push(msg);
  renderMessages();

  msgInput.value = "";
});

// عرض الرسائل
function renderMessages() {
  msgBox.innerHTML = "";

  messages.forEach(m => {
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

//////////////////////////////////////////////////
// 🔥 سحب لتحت لتحديث الصفحة (Pull To Refresh)
//////////////////////////////////////////////////

let startY = 0;

window.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

window.addEventListener("touchend", (e) => {
  let endY = e.changedTouches[0].clientY;

  // لو سحبت لتحت من فوق
  if (endY - startY > 100 && window.scrollY === 0) {
    location.reload(); // إعادة تحميل الصفحة
  }
});
