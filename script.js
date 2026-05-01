/* =========================================================
   💬 GLOBAL CHAT SYSTEM / الشات العام
========================================================= */

const homeSection = document.querySelector("#homePage");

const chatInput = homeSection?.querySelector(".chat-input");
const sendBtn = homeSection?.querySelector(".send-global");
const chatBox = homeSection?.querySelector(".chat-box");

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
}

if(sendBtn){
  sendBtn.addEventListener("touchstart", function(e){
    e.preventDefault();
    sendMessage();
  });
}

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

const dmSection = document.querySelector("#chatPage");

const dmInput = dmSection?.querySelector("#dmInput");
const dmBox = dmSection?.querySelector("#dmBox");
const dmSendBtn = dmSection?.querySelector(".send-dm-btn");

function sendDM() {

  if (!dmInput || !dmBox) return;

  const text = dmInput.value.trim();
  if (text === "") return;

  const msg = document.createElement("div");

  // 🔧 تحسين بسيط بدون تغيير النظام:
  msg.className = "user dm-msg"; 
  msg.textContent = text;

  dmBox.appendChild(msg);

  dmInput.value = "";
  dmBox.scrollTop = dmBox.scrollHeight;
}

/* ✔ أفضل من touchstart (يشتغل على كل الأجهزة) */
if (dmSendBtn) {
  dmSendBtn.addEventListener("click", function (e) {
    e.preventDefault();
    sendDM();
  });
}

/* ✔ إرسال بالـ Enter */
if (dmInput) {
  dmInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      sendDM();
    }
  });
}
/* =========================================================
   📱 NAVIGATION SYSTEM / التنقل بين الصفحات
========================================================= */

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
