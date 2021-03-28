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
  origin: 'http://localhost:3000'
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

app.get('/', (req, res) => {
  console.log("Hello world")
  res.send('Hello World!')
})

app.get('/create-new-room', (req, res) => {
  res.send({ roomId: uuidV4() })
})

io.on('connection', socket => {
  console.log("Connection")
  socket.on('join-room', (roomId, userId) => {
    console.log("Client joined room ", roomId, userId)
    socket.join(roomId)
    socket.to(roomId).emit('user-connected', userId)
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId)
    })
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
