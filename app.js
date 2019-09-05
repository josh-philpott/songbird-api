require('dotenv').config()

const cors = require('cors')
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const spotifyRouter = require('./routes/spotify')
const broadcastRouter = require('./routes/broadcast')

const broadcastServices = require('./services/broadcast.services')

const app = express()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
console.log(process.env.PORT)
http.listen(process.env.PORT || 3001)

app.use(logger('dev'))
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
  console.error(err)
  res.status(500)
  next(err)
})

io.on('connection', function(socket) {
  console.log(`a user connected ${socket.id}`)

  socket.on('create broadcast', async function(
    spotifyUserId,
    broadcasterName,
    profileImageUrl,
    ackFunction
  ) {
    const broadcastId = await broadcastServices.create(
      spotifyUserId,
      broadcasterName,
      profileImageUrl,
      socket.id
    )

    socket.join(broadcastId)
    console.log(`Created broadcast ${broadcastId}`)

    ackFunction(broadcastId)
  })

  socket.on('update broadcast', function(broadcastId, currentlyPlaying) {
    const listenerUpdateRequired = broadcastServices.update(
      broadcastId,
      currentlyPlaying
    )
    console.log(`broadcast updated: ${broadcastId}`)

    if (listenerUpdateRequired) {
      console.log(`listener update required: ${broadcastId}`)
      socket.broadcast
        .to(broadcastId)
        .emit('broadcast updated', currentlyPlaying)
    }
  })

  socket.on('disconnect', function() {
    console.log('user disconnected')
    const broadcastId = broadcastServices.getBySocketId(socket.id)
    if (broadcastId) {
      console.log(`broadcaster disconnected ${JSON.stringify(broadcastId)}`)
      broadcastServices.handleBroadcasterDisconnect()
      //TODO: Handle broadcast ending in app. Add something to broadcast object for SOW message
      socket.broadcast.to(broadcastId).emit('broadcast ended')
    }
  })

  socket.on('join', function(broadcastId) {
    socket.join(broadcastId)
    socket.emit(
      'broadcast updated',
      broadcastServices.get(broadcastId).currentlyPlaying
    )
  })
})

module.exports = app
