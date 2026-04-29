/* =========================================================
   💬 CHAT SYSTEM / نظام الرسائل
========================================================= */


/* =========================================================
   🎯 ELEMENTS / العناصر
========================================================= */

const chatInput = document.querySelector(".chat-input");
const sendBtn = document.querySelector(".send");
const chatBox = document.querySelector(".chat-box");


/* =========================================================
   🚀 SEND MESSAGE / إرسال رسالة
========================================================= */

function sendMessage(){

  const text = chatInput.value.trim();

  // ❌ منع الرسائل الفاضية
  if(text === "") return;

  // 🧱 إنشاء عنصر الرسالة
  const msg = document.createElement("div");
  msg.className = "user";
  msg.textContent = text;

  // ➕ إضافة الرسالة للشات
  chatBox.appendChild(msg);

  // 🧹 تفريغ الحقل
  chatInput.value = "";

  // 📜 تمرير لآخر رسالة
  chatBox.scrollTop = chatBox.scrollHeight;

  // ⌨️ تركيز على input
  chatInput.focus();
}


/* =========================================================
   👆 SEND BUTTON / زر الإرسال
========================================================= */

sendBtn.addEventListener("touchend", function(e){
  e.preventDefault();
  sendMessage();
});


/* =========================================================
   ⌨️ KEYBOARD / لوحة المفاتيح
========================================================= */

chatInput.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    e.preventDefault();
    sendMessage();
  }
});
