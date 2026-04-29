const chatInput = document.querySelector(".chat-input");
const sendBtn = document.querySelector(".send");
const chatBox = document.querySelector(".chat-box");

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

/* زر الإرسال */
if(sendBtn){
  sendBtn.addEventListener("click", sendMessage);
}

/* Enter */
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

const dmInput = document.getElementById("dmInput");
const dmBox = document.getElementById("dmBox");

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


/* زر إرسال DM */
document.addEventListener("click", function(e){
  if(e.target.classList.contains("send") && e.target.closest("#chatPage")){
    sendDM();
  }
});


/* Enter في DM */
if(dmInput){
  dmInput.addEventListener("keydown", function(e){
    if(e.key === "Enter"){
      e.preventDefault();
      sendDM();
    }
  });
}


/* =========================================================
   📱 PAGE NAVIGATION / التنقل بين الصفحات
========================================================= */

function goPage(pageId){

  const pages = document.querySelectorAll(".page");

  pages.forEach(p => p.style.display = "none");

  const target = document.getElementById(pageId);
  if(target){
    target.style.display = "block";
  }
}

/* فتح شات شخص */
function openChat(name){

  goPage("chatPage");

  const title = document.getElementById("chatName");
  if(title){
    title.textContent = name;
  }
}
