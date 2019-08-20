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
http.listen(8080, '127.0.0.1')

app.listen(3002)

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

//TODO: Listener SOW message to start playing immedietly when they arraive
io.on('connection', function(socket) {
  console.log(`a user connected ${socket.id}`)

  socket.on('create broadcast', async function(
    broadcasterName,
    profileImageUrl,
    debug,
    ackFunction
  ) {
    const broadcastId = await broadcastServices.create(
      broadcasterName,
      profileImageUrl,
      debug,
      socket.id
    )

    socket.join(broadcastId)
    console.log(`Created broadcast ${broadcastId}`)

    ackFunction(broadcastId)
  })

  socket.on('update broadcast', function(broadcastId, currentlyPlaying) {
    broadcastServices.update(broadcastId, currentlyPlaying)
    console.log(`broadcast updated: ${broadcastId}`)
    socket.broadcast.to(broadcastId).emit('broadcast updated', currentlyPlaying)
  })

  socket.on('disconnect', function() {
    console.log('user disconnected')
    const broadcastId = broadcastServices.getBySocketId(socket.id)
    if (broadcastId) {
      console.log(`broadcaster disconnected ${JSON.stringify(broadcastId)}`)
      //TODO: Handle broadcast ending in app. Add something to broadcast object for SOW message
      socket.broadcast.to(broadcastId).emit('broadcast ended')
    }
  })
})

module.exports = app
