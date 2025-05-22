const socket = io(); // Connect to server

const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

// Append chat messages
function appendMessage({ username, message, imageUrl }) {
  const messageContainer = document.createElement("div");
  messageContainer.classList.add("chat-message");

  const userPara = document.createElement("p");
  userPara.textContent = `${username}: ${message}`;
  messageContainer.appendChild(userPara);

  if (imageUrl) {
    const img = document.createElement("img");
    img.src = imageUrl;
    img.alt = "Uploaded image";
    img.style.maxWidth = "150px";
    messageContainer.appendChild(img);
  }

  chatBox.appendChild(messageContainer);
}

// Load full chat history
socket.on('chatHistory', (messages) => {
  chatBox.innerHTML = "";
  messages.forEach(appendMessage);
});

// Receive live message
socket.on('newMessage', (message) => {
  appendMessage(message);
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  // 🔼 NEW: Tell the server who the user is
  socket.emit("registerUser", {
    username: formData.get("username"),
  });

  // Send chat + optional image
  await fetch("/chat", {
    method: "POST",
    body: formData,
  });

  form.reset();
});
