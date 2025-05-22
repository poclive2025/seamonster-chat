const RENDER_URL = ""; // Set to your backend URL when deployed, or empty for local

const form = document.getElementById("chat-form");
const chatBox = document.getElementById("chat-box");

form.addEventListener("submit", async function (e) {
  e.preventDefault();

  const formData = new FormData(form); // grabs all inputs + file

  const res = await fetch(`${RENDER_URL}/chat`, {
    method: "POST",
    body: formData, // send as multipart/form-data
  });

  const data = await res.json();

  const messageContainer = document.createElement("div");
  messageContainer.classList.add("chat-message");

  const userPara = document.createElement("p");
  userPara.textContent = `${data.username}: ${data.message}`;
  messageContainer.appendChild(userPara);

  if (data.imageUrl) {
    const img = document.createElement("img");
    img.src = data.imageUrl;
    img.alt = "Uploaded image";
    img.style.maxWidth = "150px";
    messageContainer.appendChild(img);
  }

  chatBox.appendChild(messageContainer);
  form.reset();
});
