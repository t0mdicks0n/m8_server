const express = require('express')
const app = express()
const server = require('http').Server(app)
var cors = require('cors');
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors({
  origin: '*'
}));

/*const { ExpressPeerServer } = require('peer');
const peerExpress = require('express');
const peerApp = peerExpress();
const peerServer = require('http').createServer(peerApp);
const options = { debug: true }
const peerPort = 3003;
peerApp.use('/peerjs', ExpressPeerServer(peerServer, options));
peerServer.listen(peerPort);*/

const { v4: uuidV4 } = require('uuid')

let roomIds = {}

app.get('/', (req, res) => {
  console.log("Hello world")
  res.send('Hello World!')
})

app.get('/create-new-room', (req, res) => {
  let roomId = uuidV4()
  roomIds[roomId] = {"roomId": roomId, "users": {}}
  res.send({ roomId: roomId })
})

app.get('/rooms/:room/users', (req, res) => {
  if (!(req.params.room in roomIds)) {
    res.send({ error: "No room with id" + req.params.room})
  }
  let roomObj = roomIds[req.params.room]
  console.log("Found users in room", roomObj["users"])
  res.send({ users: roomObj["users"]})
})

io.on('connection', socket => {
  console.log("New connection ", Math.floor(Math.random() * 10))
  socket.on('join-room', (roomId, userId) => {
    console.log("Client joined room ", roomId, userId)
    // TODO: handle error callback({message:'testing error'});
    if (roomId in roomIds) {
      roomIds[roomId]["users"][userId] = {"userId": userId}
      socket.join(roomId)
      socket.to(roomId).emit('user-connected', userId, roomId)
      socket.on('disconnect', () => {
        socket.to(roomId).emit('user-disconnected', userId)
      })
    }
  })

  socket.on('hello', () => {
    console.log("hello")
  })

})

if (module === require.main) {
  const PORT = process.env.PORT || 8080;
  server.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`);
    console.log('Press Ctrl+C to quit.');
  });
}

module.exports = server;
