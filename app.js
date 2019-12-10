require('dotenv').config()

const cors = require('cors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('./logger')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const spotifyRouter = require('./routes/spotify')
const broadcastRouter = require('./routes/broadcast')

const { makeHandlers } = require('./websockets/handlers')
const port = process.env.PORT || 3001
logger.info(`Booting songbridge api. Starting server on port ${port}`)

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', indexRouter)
app.use('/api/users', usersRouter)
app.use('/api/spotify', spotifyRouter)
app.use('/api/broadcast', broadcastRouter)

//default error handler
app.use(function(err, req, res, next) {
  logger.error(err)
  res.status(500)
  next(err)
})

io.on('connection', function(socket) {
  const {
    handleInitBroadcast,
    handleClientDisconnect,
    handleClientJoin,
    handleUpdateBroadcast,
    handlePauseBroadcast,
    handleChatMessage
  } = makeHandlers(socket, io)
  socket.on('init broadcast', handleInitBroadcast)
  socket.on('update broadcast', handleUpdateBroadcast)
  socket.on('pause broadcast', handlePauseBroadcast)
  socket.on('disconnect', handleClientDisconnect)
  socket.on('join', handleClientJoin)
  socket.on('message', handleChatMessage)
  socket.on('echo', function(msg) {
    io.emit('echo', msg)
  })
})

http.listen(port)
module.exports = app
