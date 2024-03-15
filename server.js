const express = require('express');
const app = express();
const userRoutes = require('./routes/userRoutes')
const roomRoutes = require('./routes/roomRoutes')
const User = require('./models/User');
const Message = require('./models/Message')
const Room = require('./models/Room')
const rooms = ['General', 'Programming', 'Core', 'Fun', 'Sports'];
const cors = require('cors');
require('dotenv').config();
const mongoose = require('mongoose')


app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'https://mern-chat-app-frontend-alpha.vercel.app/',
  methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['X-Requested-With', 'Content-Type'],
  credentials: true
}));

app.use('/users', userRoutes)
app.use('/room', roomRoutes)
require('./connection')


const server = require('http').createServer(app);
const PORT = process.env.PORT;
const io = require('socket.io')(server, {
  cors: {
    // origin: process.env.CLIENT_URL,
    // origin: 'http://localhost:3000',
    origin: "https://mern-chat-app-frontend-alpha.vercel.app",
    methods: ['GET', 'POST']
  }
})


async function getLastMessagesFromRoom(room) {
  let roomMessages = await Message.aggregate([
    { $match: { to: room } },
    { $group: { _id: '$date', messagesByDate: { $push: '$$ROOT' } } }
  ])

  await Message.populate(roomMessages, { path: 'messagesByDate.from', model: 'User' })
  // console.log(roomMessages)
  return roomMessages;
}

function sortRoomMessagesByDate(messages) {
  return messages.sort(function (a, b) {
    let date1 = a._id.split('/');
    let date2 = b._id.split('/');

    date1 = date1[2] + date1[0] + date1[1]
    date2 = date2[2] + date2[0] + date2[1];

    return date1 < date2 ? -1 : 1
  })
}

// socket connection

io.on('connection', (socket) => {

  socket.on('new room', async () => {
    const rooms = await Room.find()
    // const data = {'rooms':rooms}
    io.emit('new room', rooms)
  })

  socket.on('new-user', async () => {
    const members = await User.find();
    io.emit('new-user', members)
  })

  socket.on('join-room', async (newRoom, previousRoom) => {
    socket.join(newRoom);
    socket.leave(previousRoom);
    let roomMessages = await getLastMessagesFromRoom(newRoom);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    socket.emit('room-messages', roomMessages)
  })

  socket.on('message-room', async (room, content, sender, time, date) => {
    // console.log(content);
    // console.log(room)
    const newMessage = await Message.create({ content, from: mongoose.Types.ObjectId(sender), time, date, to: room });
    let roomMessages = await getLastMessagesFromRoom(room);
    roomMessages = sortRoomMessagesByDate(roomMessages);
    // sending message to room
    io.to(room).emit('room-messages', roomMessages);
    socket.broadcast.emit('notifications', room)
  })

  app.delete('/logout', async (req, res) => {
    try {
      const { _id, newMessages } = req.body;
      const user = await User.findById(_id);
      user.status = "offline";
      user.newMessages = newMessages;
      await user.save();
      const members = await User.find();
      socket.broadcast.emit('new-user', members);
      console.log(user)
      res.status(200).send();
    } catch (e) {
      console.log(e);
      res.status(400).send()
    }
  })

})


app.get('/rooms', (req, res) => {
  res.json(rooms)
})

app.get('/', (req, res) => {
  res.send("Hello!!,How are you?")
})

if (!server.listening) {
  server.listen(PORT, () => {
    console.log('listening to port', PORT)
  })
}


