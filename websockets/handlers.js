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
    logger.debug('Called init broadcast')
    const broadcastId = await broadcastActions.setupBroadcast(
      spotifyUserId,
      broadcasterName,
      profileImageUrl,
      client.id
    )

    client.join(broadcastId)
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

    if (broadcastId !== profileId) {
      await broadcastActions.addViewer(
        broadcastId,
        client.id,
        profileId,
        name,
        profileImageUrl
      )

      const viewers = await broadcastActions.getViewers(broadcastId)
      client.emit('viewers update', viewers)

      logger.info(`broadcast: ${broadcastId} - viewers updated `, viewers)
      client.broadcast.to(broadcastId).emit('viewers update', viewers)
    }

    //user who just joined the broadcast will get a broadcast updated event
    //and everyone on the broadcast will get a viewers updated
    const broadcast = await broadcastActions.getById(broadcastId)
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
    console.log('received chat message', message, broadcastId)
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
