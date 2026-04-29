const chatInput = document.querySelector(".chat-input");
const sendBtn = document.querySelector(".send");
const chatBox = document.querySelector(".chat-box");


/* =========================
   🚀 SEND MESSAGE / إرسال رسالة
========================= */

function sendMessage(){

  const text = chatInput.value.trim();

  // ❌ لو الرسالة فاضية
  if(text === "") return;

  // 🧱 إنشاء رسالة جديدة
  const msg = document.createElement("div");
  msg.className = "user";
  msg.textContent = text;

  // ➕ إضافة الرسالة للشات
  chatBox.appendChild(msg);

  // 🧹 تنظيف الحقل
  chatInput.value = "";

  // 📜 التمرير لآخر رسالة
  chatBox.scrollTop = chatBox.scrollHeight;

  // ⌨️ إعادة التركيز
  chatInput.focus();
}


/* =========================
   👆 BUTTON EVENT / زر الإرسال
========================= */

sendBtn.addEventListener("touchend", function(e){
  e.preventDefault();
  sendMessage();
});


/* =========================
   ⌨️ KEYBOARD EVENT / لوحة المفاتيح
========================= */

chatInput.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    e.preventDefault();
    sendMessage();
  }
});
