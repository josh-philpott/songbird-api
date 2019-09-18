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
    console.log(`broadcast ${broadcastId} updated by ${socket.id}`)

    if (listenerUpdateRequired) {
      console.log(`listener update required: ${broadcastId}`)
      io.in(broadcastId).emit('broadcast updated', currentlyPlaying)
    }
  })

  socket.on('disconnect', function() {
    console.log('user disconnected')

    //check if it's the broadcaster that disconnected
    const broadcastId = broadcastServices.getBySocketId(socket.id)
    if (broadcastId) {
      console.log(`broadcaster disconnected ${JSON.stringify(broadcastId)}`)
      broadcastServices.handleBroadcasterDisconnect()
      socket.broadcast.to(broadcastId).emit('broadcaster disconnected')
    } else {
      //it was a listener that disconnected.
      const broadcast = broadcastServices.removeViewer(socket.id)
      if (broadcast) {
        console.log('sending viewers update')
        console.log(broadcast.viewers)
        console.log(broadcast)
        socket.broadcast
          .to(broadcast.broadcastId)
          .emit('viewers update', broadcast.viewers)
      }
    }
  })

  /**
   * Viewer joins a broadcast and sends along their profile id,
   * profile image URL, and name
   */
  socket.on('join', function(
    broadcastId,
    isBroadcaster,
    profileId,
    name,
    profileImageUrl
  ) {
    console.log('join')
    socket.join(broadcastId)

    if (!isBroadcaster) {
      const viewers = broadcastServices.addViewer(
        broadcastId,
        socket.id,
        profileId,
        name,
        profileImageUrl
      )

      //user who just joined the broadcast will get a broadcast updated event
      //and everyone on the broadcast will get a viewers updated
      const broadcast = broadcastServices.get(broadcastId)
      const currentlyPlaying = broadcast ? broadcast.currentlyPlaying : null
      socket.emit('broadcast updated', currentlyPlaying)
      socket.emit('viewers update', viewers)

      console.log('viewers updated', viewers)
      socket.broadcast.to(broadcastId).emit('viewers update', viewers)
    }
  })
})

module.exports = app
