// فتح وإغلاق السايدبار
function toggleSidebar(show) {
  document.getElementById("sidebar").style.display = show ? "block" : "none";
}

// التنقل بين الصفحات
function setSection(id) {
  document.querySelectorAll(".section").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// إرسال رسالة (تجريبي)
function sendMessage() {
  const input = document.getElementById("msgInput");
  const chat = document.getElementById("chatWindow");

  if (!input.value.trim()) return;

  const msg = document.createElement("div");
  msg.textContent = "👤 " + input.value;

  chat.appendChild(msg);
  input.value = "";

  chat.scrollTop = chat.scrollHeight;
}
