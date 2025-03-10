const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-body');

socket.on('bot message', (message) => {
  //check if message.text is an array
  if (Array.isArray(message.text)) {
    let msg = message.text
      .map((item) => `${item.number}: ${item.text}`)
      .join(`<br>`);

    if (message.type == 'currentOrder') {
      msg = 'Your current order is: <br>' + msg;
    } else if (message.type == 'orderHistory') {
      msg = 'Your order history is: <br>' + msg;
    } else {
      msg = 'Please select a number from the list below: <br>' + msg;
    }
    message.text = msg;
  } else {
    message.text = message.text;
  }
  outputMessage("Fawaz's ChatBot", message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('user message', (message) => {
  // console.log(message);
  outputMessage('You', message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.emit('private message', msg);

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
const outputMessage = (sender, message) => {
  const div = document.createElement('div');
  div.classList.add('chat-messages');
  if (sender === "Fawaz's ChatBot") {
    div.classList.add('bot');
  } else {
    div.classList.add('user');
  }

  div.innerHTML = `
  <p class="meta">${message.username} <span>${message.time}</span></p>
						<p class="text">${message.text}</p>`;
  document.querySelector('.chat-body').appendChild(div);
};
