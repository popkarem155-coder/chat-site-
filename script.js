/* =========================================================
   💬 GLOBAL CHAT SYSTEM / الشات العام
========================================================= */

/* 🎯 ELEMENTS / العناصر */
const chatInput = document.querySelector(".chat-input");
const sendBtn = document.querySelector(".send");
const chatBox = document.querySelector(".chat-box");


/* 🚀 SEND MESSAGE / إرسال رسالة */
function sendMessage(){

  if(!chatInput || !chatBox) return;

  const text = chatInput.value.trim();
  if(text === "") return;

  const msg = document.createElement("div");
  msg.className = "user";
  msg.textContent = text;

  chatBox.appendChild(msg);

  chatInput.value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
  chatInput.focus();
}


/* 👆 CLICK EVENT / زر الإرسال */
if(sendBtn){
  sendBtn.addEventListener("click", sendMessage);
}


/* ⌨️ ENTER EVENT / زر Enter */
if(chatInput){
  chatInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      e.preventDefault();
      sendMessage();
    }
  });
}


/* =========================================================
   📩 DM CHAT SYSTEM / الرسائل الخاصة
========================================================= */

/* 🎯 ELEMENTS / العناصر */
const dmInput = document.getElementById("dmInput");
const dmBox = document.getElementById("dmBox");


/* 🚀 SEND DM / إرسال رسالة خاصة */
function sendDM(){

  if(!dmInput || !dmBox) return;

  const text = dmInput.value.trim();
  if(text === "") return;

  const msg = document.createElement("div");
  msg.className = "user";
  msg.textContent = text;

  dmBox.appendChild(msg);

  dmInput.value = "";
  dmBox.scrollTop = dmBox.scrollHeight;
}


/* 👆 CLICK EVENT / زر الإرسال */
document.addEventListener("click", function(e){
  if(e.target.classList.contains("send") && e.target.closest("#chatPage")){
    sendDM();
  }
});


/* ⌨️ ENTER EVENT / زر Enter */
if(dmInput){
  dmInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      e.preventDefault();
      sendDM();
    }
  });
}


/* =========================================================
   📱 NAVIGATION SYSTEM / التنقل بين الصفحات
========================================================= */

/* 🔄 SWITCH PAGE / تغيير الصفحة */
function goPage(pageId){

  const pages = document.querySelectorAll(".page");

  pages.forEach(p => p.style.display = "none");

  const target = document.getElementById(pageId);
  if(target){
    target.style.display = "block";
  }
}


/* 💬 OPEN CHAT / فتح محادثة */
function openChat(name){

  goPage("chatPage");

  const title = document.getElementById("chatName");

  if(title){
    title.textContent = name;
  }
}
