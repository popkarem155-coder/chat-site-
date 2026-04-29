const chatInput = document.querySelector(".chat-input");
const sendBtn = document.querySelector(".send");
const chatBox = document.querySelector(".chat-box");

function sendMessage(){
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

sendBtn.addEventListener("touchend", function(e){
  e.preventDefault();
  sendMessage();
});

chatInput.addEventListener("keydown", function(e){
  if(e.key === "Enter"){
    e.preventDefault();
    sendMessage();
  }
});
