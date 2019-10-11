const broadcastActions = require('./broadcast.actions')

const handleCreateBroadcast = async (
  socket,
  spotifyUserId,
  broadcasterName,
  profileImageUrl,
  ackFunction
) => {
  const broadcastId = await broadcastActions.setupBroadcast(
    spotifyUserId,
    broadcasterName,
    profileImageUrl,
    socket.id
  )

  socket.join(broadcastId)

  console.log(`Setup broadcast ${broadcastId}`)

  ackFunction(broadcastId)
}

module.exports = {
  handleCreateBroadcast
}
