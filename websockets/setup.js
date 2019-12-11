const { makeHandlers } = require('./handlers')

module.exports = server => {
  const io = require('socket.io')(server)
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
  console.log('setup websockets!')
}
