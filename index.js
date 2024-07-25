const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const { v4: uuidv4 } = require('uuid');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', (socket) => {
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };

  const sessionId = uuidv4(); // Generate a unique session ID
  socket.join(sessionId);
  socket.emit('bot message', {
    username: "Fawaz's Chatbot",
    text: 'Welcome To Our Restaurant',
    time: new Date().toLocaleTimeString('en-US', options),
  });
  emitBotMenu(socket, options);

  let level = 0;
  let currentOrder = [];
  let orderHistory = [];

  socket.on('private message', (msg) => {
    io.to(sessionId).emit('user message', {
      username: 'You',
      text: msg,
      time: new Date().toLocaleTimeString('en-US', options),
    });
    //check if the entered message is a number
    if (!isNaN(msg)) {
      //check if the number is within the range of the options
      switch (level) {
        case 0:
          if (msg == 1) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'You have selected to place an order. Please select a category to continue.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            botFoodMenu(io, sessionId, options);
            level = 1;
          } else if (msg == 99) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'You have selected to checkout your order...',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            orderHistory = [...orderHistory, ...currentOrder];
            currentOrder = [];
            emitBotMenu(socket, options, sessionId, io);
          } else if (msg == 98) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'You have selected to check your order history...',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: convertCurrentOrderToText(orderHistory),
              type: 'orderHistory',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            emitBotMenu(socket, options, sessionId, io);
          } else if (msg == 97) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'You have selected to check your current order...',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: convertCurrentOrderToText(currentOrder),
              time: new Date().toLocaleTimeString('en-US', options),
              type: 'currentOrder',
            });
            emitBotMenu(socket, options, sessionId, io);
          } else if (msg == 0) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'You have selected to cancel your order. Please wait while we cancel your order.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            currentOrder = [];
            emitBotMenu(socket, options, sessionId, io);
          } else {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'Invalid option selected. Please select a valid option from 1, 99, 98, 97 and 0.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            emitBotMenu(socket, options);
          }
          break;
        case 1:
          if (msg == 1) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'Food has been added to your order.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            currentOrder = addToHistory(currentOrder, 'Food', 5000);
            emitBotMenu(socket, options, sessionId, io);
            level = 0;
          } else if (msg == 2) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'Drinks has been added to your order.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            emitBotMenu(socket, options, sessionId, io);
            currentOrder = addToHistory(currentOrder, 'Drink', 1500);
            level = 0;
          } else if (msg == 3) {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'Dessert has been added to your order.',
              time: new Date().toLocaleTimeString('en-US', options),
            });
            emitBotMenu(socket, options, sessionId, io);
            currentOrder = addToHistory(currentOrder, 'Dessert', 3000);
            level = 0;
          } else {
            io.to(sessionId).emit('bot message', {
              username: "Fawaz's ChatBot",
              text: 'Enter a valid option from 1, 2, 3 to place an order',
              time: new Date().toLocaleTimeString('en-US', options),
            });
          }
          // console.log(currentOrder);
          break;
      }
    } else {
      text =
        level == 0
          ? 'Please enter an option from 1, 99, 98, 97,0 to get started'
          : 'Please enter a number from 1, 2, 3, 4 to place an order';
      io.to(sessionId).emit('bot message', {
        username: "Fawaz's ChatBot",
        text,
        time: new Date().toLocaleTimeString('en-US', options),
      });
    }
    //confirm if they are currently ordering/checking out/ viewing history and respond accordingly
    //else respond with an error bot message
  });
});

server.listen(3000, () => {
  console.log('Server running on port 3000');
});

function emitBotMenu(socket, options, sessionId, io) {
  if (!sessionId) {
    socket.emit('bot message', {
      username: "Fawaz's ChatBot",
      text: [
        { number: 1, text: 'Place An Order' },
        { number: 99, text: 'Checkout Order' },
        { number: 98, text: 'Check Order History' },
        { number: 97, text: 'Check Current Order' },
        { number: 0, text: 'Cancel Order' },
      ],
      time: new Date().toLocaleTimeString('en-US', options),
    });
  } else {
    io.to(sessionId).emit('bot message', {
      username: "Fawaz's ChatBot",
      text: [
        { number: 1, text: 'Place An Order' },
        { number: 99, text: 'Checkout Order' },
        { number: 98, text: 'Check Order History' },
        { number: 97, text: 'Check Current Order' },
        { number: 0, text: 'Cancel Order' },
      ],
      time: new Date().toLocaleTimeString('en-US', options),
    });
  }
}
function botFoodMenu(io, sessionId, options) {
  io.to(sessionId).emit('bot message', {
    username: "Fawaz's ChatBot",
    text: [
      { number: 1, text: 'Food for #5000' },
      { number: 2, text: 'Drinks for #1500' },
      { number: 3, text: 'Desserts for #3000' },
    ],
    time: new Date().toLocaleTimeString('en-US', options),
  });
}

function addToHistory(currentOrder, orderType, price) {
  let totalOrder = [];
  const index = currentOrder.findIndex((obj) => obj.text === orderType);
  if (index == -1) {
    totalOrder = [
      ...currentOrder,
      { number: currentOrder.length + 1, text: orderType, price: price },
    ];
  } else {
    // console.log(currentOrder);
    currentOrder[index] = {
      number: currentOrder[index].number,
      text: orderType,
      price: currentOrder[index].price + price,
    };
    totalOrder = [...currentOrder];
  }
  return totalOrder;
}

function convertCurrentOrderToText(currentOrder) {
  console.log(currentOrder);

  return currentOrder.map((obj) => ({
    number: obj.number,
    text: `${obj.text} at a price of ${obj.price}`,
  }));
}
