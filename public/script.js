const socket = io(); // Connects to backend automatically

const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

// Append a message to chat box
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

// Receive full chat history on connect
socket.on('chatHistory', (messages) => {
  chatBox.innerHTML = "";
  messages.forEach(appendMessage);
});

// Receive new messages live
socket.on('newMessage', (message) => {
  appendMessage(message);
});

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form);

  // Send message & image via REST POST as before
  await fetch("/chat", {
    method: "POST",
    body: formData,
  });

  form.reset();
});
