const broadcastActions = require('../services/broadcast.actions')
const { uniq } = require('lodash')

const makeHandlers = (client, socketIO) => {
  const handleInitBroadcast = async (
    spotifyUserId,
    broadcasterName,
    profileImageUrl,
    ackFunction
  ) => {
    console.log('Called init broadcast')
    const broadcastId = await broadcastActions.setupBroadcast(
      spotifyUserId,
      broadcasterName,
      profileImageUrl,
      client.id
    )

    client.join(broadcastId)
    console.log(`Created broadcast ${broadcastId}`)

    ackFunction(broadcastId)
  }

  const handleClientDisconnect = async () => {
    //check if there's a broadcast running off the disconnected socket
    const broadcast = await broadcastActions.getBySocketId(client.id)
    if (broadcast) {
      console.log(`broadcaster disconnected ${JSON.stringify(broadcast.id)}`)
      broadcastActions.handleBroadcasterDisconnect(broadcast.id)
      client.broadcast.to(broadcast.id).emit('broadcaster disconnected')
    }

    //check if the socket had was a viewer to any other broadcasts
    const removedViewers = await broadcastActions.removeViewer(client.id)
    if (removedViewers && removedViewers.length) {
      const updatedBroadcastIds = removedViewers.map(rv => {
        return rv.broadcastId
      })
      const uniqBroadcastIds = uniq(updatedBroadcastIds)
      console.log(uniqBroadcastIds)
      console.log(`Removing ${client.id} from broadcasts ${uniqBroadcastIds}`)
      uniqBroadcastIds.forEach(async broadcastId => {
        const viewers = await broadcastActions.getViewers(broadcastId)
        console.log(
          `sending viewers update to ${broadcastId} - viewers: ${viewers}`
        )

        client.broadcast.to(broadcastId).emit('viewers update', viewers)
      })
    }
    console.log('removed viewers', removedViewers)
    if (removedViewers) {
      //it was a listener that disconnected.
      const removedViewers = await broadcastActions.removeViewer(client.id)
      console.log('removed viewers', removedViewers)

      if (broadcast) {
        client.broadcast
          .to(broadcast.broadcastId)
          .emit('viewers update', broadcast.viewers)
      }
    }
  }

  const handleClientJoin = async (
    broadcastId,
    isBroadcaster,
    profileId,
    name,
    profileImageUrl
  ) => {
    console.log(
      `client ${client.id} (user: ${profileId}) requested to join ${broadcastId}`
    )
    client.join(broadcastId)

    if (broadcastId !== profileId) {
      await broadcastActions.addViewer(
        broadcastId,
        client.id,
        profileId,
        name,
        profileImageUrl
      )

      const viewers = await broadcastActions.getViewers(broadcastId)

      //user who just joined the broadcast will get a broadcast updated event
      //and everyone on the broadcast will get a viewers updated
      const broadcast = await broadcastActions.getById(broadcastId)
      console.log(broadcast)
      const currentlyPlaying = broadcast ? broadcast.currentlyPlaying : null
      if (currentlyPlaying) {
        client.emit('broadcast updated', currentlyPlaying)
      }
      client.emit('viewers update', viewers)

      console.log('viewers updated', viewers)
      client.broadcast.to(broadcastId).emit('viewers update', viewers)
    }
  }

  const handleUpdateBroadcast = (broadcastId, currentlyPlaying) => {
    const listenerUpdateRequired = broadcastActions.update(
      broadcastId,
      currentlyPlaying
    )
    console.log(`broadcast ${broadcastId} updated by ${client.id}`)

    if (listenerUpdateRequired) {
      console.log(`Updating listeners {broadcastId: ${broadcastId}}`)
      socketIO.in(broadcastId).emit('broadcast updated', currentlyPlaying)
    }
  }

  const handlePauseBroadcast = async broadcastId => {
    console.log('handling pause broadcast: ', broadcastId)
    await broadcastActions.pauseBroadcasting(broadcastId)
    socketIO.in(broadcastId).emit('broadcaster paused')
  }

  return {
    handleInitBroadcast,
    handleClientDisconnect,
    handleClientJoin,
    handleUpdateBroadcast,
    handlePauseBroadcast
  }
}

module.exports = {
  makeHandlers
}
