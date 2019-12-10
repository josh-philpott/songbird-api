const { uniq } = require('lodash')

const broadcastActions = require('../services/broadcast.actions')
const logger = require('../logger')

const makeHandlers = (client, socketIO) => {
  const handleInitBroadcast = async (
    spotifyUserId,
    broadcasterName,
    profileImageUrl,
    ackFunction
  ) => {
    logger.info(
      `Called init broadcast ${spotifyUserId}, ${broadcasterName}, ${profileImageUrl},${ackFunction}`
    )
    const broadcastId = await broadcastActions.setupBroadcast(
      spotifyUserId,
      broadcasterName,
      profileImageUrl,
      client.id
    )
    console.log(broadcastId)

    client.join(broadcastId)
    await handleClientJoin(spotifyUserId, true, spotifyUserId)
    logger.info(`broadcast: ${broadcastId} - initialized`)

    ackFunction(broadcastId)
  }

  const handleClientDisconnect = async () => {
    //check if there's a broadcast running off the disconnected socket
    const broadcast = await broadcastActions.getBySocketId(client.id)
    if (broadcast) {
      logger.info(`broadcast: ${broadcast.id} - broadcaster disconnected`)
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
      uniqBroadcastIds.forEach(async broadcastId => {
        const viewers = await broadcastActions.getViewers(broadcastId)
        logger.info(
          `broadcast: ${broadcastId} - client ${client.id} disconnected`
        )

        client.broadcast.to(broadcastId).emit('viewers update', viewers)
      })
    }

    if (removedViewers) {
      //it was a listener that disconnected.
      await broadcastActions.removeViewer(client.id)
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
    client.join(broadcastId)
    console.log(broadcastId)
    const broadcast = await broadcastActions.getById(broadcastId)
    let viewers = await broadcastActions.getViewers(broadcastId)

    //emit state of broadcast immedietly
    console.log('emitting sob')
    client.emit('sob', {
      currentlyPlaying: broadcast.currentlyPlaying,
      viewers,
      broadcastMeta: {
        id: broadcast.id,
        profileImageUrl: broadcast.profileImageUrl,
        displayName: broadcast.broadcasterName,
        isConnected: broadcast.isBroadcasterConnected,
        isSyncEnabled: broadcast.isBroadcasting,
        lastUpdated: broadcast.updated_at
      }
    })

    if (broadcastId !== profileId) {
      await broadcastActions.addViewer(
        broadcastId,
        client.id,
        profileId,
        name,
        profileImageUrl
      )

      viewers = await broadcastActions.getViewers(broadcastId)
      logger.info(`broadcast: ${broadcastId} - viewers updated `, viewers)
      client.broadcast.to(broadcastId).emit('viewers update', viewers)
    }

    //user who just joined the broadcast will get a broadcast updated event
    //and everyone on the broadcast will get a viewers updated
    const currentlyPlaying = broadcast ? broadcast.currentlyPlaying : null
    if (currentlyPlaying) {
      client.emit('broadcast updated', currentlyPlaying)
    }

    logger.info(
      `broadcast: ${broadcastId} - client ${client.id}|${profileId} joined`
    )
  }

  const handleUpdateBroadcast = async (broadcastId, currentlyPlaying) => {
    const listenerUpdateRequired = await broadcastActions.update(
      broadcastId,
      currentlyPlaying
    )
    logger.info(`broadcast: ${broadcastId} - updated by ${client.id}`)

    if (listenerUpdateRequired) {
      logger.info(`broadcast: ${broadcastId} - listener update required`)
      socketIO.in(broadcastId).emit('broadcast updated', currentlyPlaying)
    }
  }

  const handlePauseBroadcast = async broadcastId => {
    logger.info(`broadcast: ${broadcastId} - paused`)
    await broadcastActions.pauseBroadcasting(broadcastId)
    socketIO.in(broadcastId).emit('broadcaster paused')
  }

  const handleChatMessage = async (message, broadcastId) => {
    socketIO.in(broadcastId).emit('message', message)
  }

  return {
    handleInitBroadcast,
    handleClientDisconnect,
    handleClientJoin,
    handleUpdateBroadcast,
    handlePauseBroadcast,
    handleChatMessage
  }
}

module.exports = {
  makeHandlers
}
