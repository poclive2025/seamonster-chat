const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", async function (e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const message = document.getElementById("message").value;

  const res = await fetch("https://seamonster-chat.onrender.com/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, message }),
  });

  const data = await res.json();
  const p = document.createElement("p");
  p.textContent = data.response;
  chatBox.appendChild(p);

  form.reset();
});
