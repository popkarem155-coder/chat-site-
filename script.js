function go(page){
  document.getElementById("homePage").classList.remove("active");
  document.getElementById("dmPage").classList.remove("active");

  if(page === "home"){
    document.getElementById("homePage").classList.add("active");
  } else {
    document.getElementById("dmPage").classList.add("active");
  }
}

/* HOME CHAT */
function sendHome(){
  const input = document.getElementById("homeInput");
  const box = document.getElementById("homeChat");

  if(input.value.trim() === "") return;

  const div = document.createElement("div");
  div.className = "user";
  div.textContent = input.value;

  box.appendChild(div);
  input.value = "";
}

/* DM CHAT */
function sendDM(){
  const input = document.getElementById("dmInput");
  const box = document.getElementById("dmChat");

  if(input.value.trim() === "") return;

  const div = document.createElement("div");
  div.className = "user";
  div.textContent = input.value;

  box.appendChild(div);
  input.value = "";
}
