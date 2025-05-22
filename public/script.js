const socket = io(); // Connect to Socket.IO server

const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

// Append message (with optional image) to chat box
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
    img.style.display = "block";
    img.style.marginTop = "8px";
    messageContainer.appendChild(img);
  }

  chatBox.appendChild(messageContainer);
  chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to newest message
}

// On connect, receive chat history and display it
socket.on("chatHistory", (messages) => {
  chatBox.innerHTML = ""; // Clear chat box
  messages.forEach(appendMessage);
});

// When a new message is broadcast, append it live
socket.on("newMessage", (message) => {
  appendMessage(message);
});

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(form);

  const res = await fetch("/chat", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    alert("Failed to send message");
  }

  form.reset();
});
