function toggleMenu() {
  document.getElementById("menu").classList.toggle("hidden");
}

function openMessages() {
  window.location.href = "messages.html";
}

/* 💬 fake chat */
function sendMsg() {
  let input = document.getElementById("msg");
  let box = document.getElementById("chatBox");

  if(input.value.trim() !== "") {
    let msg = document.createElement("div");
    msg.textContent = input.value;
    box.appendChild(msg);
    input.value = "";
  }
}
