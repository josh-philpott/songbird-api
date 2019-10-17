const knex = require('./postgres.services')
const broadcastServices = require('./broadcast.services')
const viewerServices = require('./viewer.services')

const setupBroadcast = async (
  spotifyUserId,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  try {
    const existingBroadcast = await broadcastServices.getById(spotifyUserId)
    console.log('Existing Broadcast: ', existingBroadcast)

    if (existingBroadcast) {
      console.log(
        `Updating broadcaster info: ${spotifyUserId}, ${broadcasterName}, ${profileImageUrl}, ${socketId}`
      )
      const updatedBroadcast = await broadcastServices.updateBroadcasterInfo(
        spotifyUserId,
        broadcasterName,
        profileImageUrl,
        socketId
      )
      console.log('Successfully updated broadcast', updatedBroadcast)
    } else {
      const broadcastRow = await broadcastServices.insertBroadcasterInfo(
        spotifyUserId,
        broadcasterName,
        profileImageUrl,
        socketId
      )
      console.log('Successfully created broadcast', broadcastRow)
    }
    return spotifyUserId
  } catch (e) {
    console.error('Failed to create broadcast', e)
    throw e
  }
}

const getById = async broadcastId => {
  return await broadcastServices.getById(broadcastId)
}

const list = async () => {
  const broadcasts = await broadcastServices.getIds()
  const broadcastIds = broadcasts.map(broadcast => {
    return broadcast.id
  })
  return broadcastIds
}

/**
 *
 * @param {*} prev spotify currently playing object from the last update
 * @param {*} current
 */
const shouldUpdateListeners = (prev, prevUpdateTime, current) => {
  if (!prev) {
    return true
  }

  /// if the song id's the same, is_playing is the same, and the song is about where we expect it to be, don't update
  const isSameSongId = prev.id === current.id
  const isSameIsPlaying = prev.is_playing === current.is_playing

  const songTimeDiff = current.progress_ms - prev.progress_ms
  const realTimeDiff = new Date().getTime() - prevUpdateTime.getTime()

  const songSkipDetected = Math.abs(songTimeDiff - realTimeDiff) > 1000

  if (isSameSongId && isSameIsPlaying && !songSkipDetected) {
    return false
  }

  //default to returning true unless any of the above cases
  return true
}

const update = async (broadcastId, currentlyPlaying) => {
  //determine if we need to update listeners
  let prev, prevUpdateTime

  const broadcast = broadcastServices.getById(broadcastId)

  if (broadcast) {
    prev = broadcast.currentlyPlaying
    prevUpdateTime = broadcast.lastUpdated
  }

  const updateListeners = shouldUpdateListeners(
    prev,
    prevUpdateTime,
    currentlyPlaying
  )

  await broadcastServices.updateCurrentlyPlaying(broadcastId, currentlyPlaying)

  return updateListeners
}

const handleBroadcasterDisconnect = async broadcastId => {
  console.log('handle broadcaster disconnect', broadcastId)
  await broadcastServices.updateIsBroadcasterConnected(broadcastId, false)
}

const getBySocketId = async socketId => {
  return await broadcastServices.getBySocketId(socketId)
}

const addViewer = async (broadcastId, socketId, id, name, profileImageUrl) => {
  await viewerServices.addViewerToBroadcast(
    broadcastId,
    id,
    name,
    profileImageUrl,
    socketId
  )
}

/**
 * Remove a viewer by socketId
 * @param {} socketId
 */
const removeViewer = async socketId => {
  return await viewerServices.removeViewerBySocketId(socketId)
}

const getViewers = async broadcastId => {
  return await viewerServices.getViewersByBroadcastId(broadcastId)
}

const pauseBroadcasting = async broadcastId => {
  return await broadcastServices.updateIsBroadcasting(broadcastId, false)
}

module.exports = {
  addViewer,
  getById,
  getBySocketId,
  getViewers,
  handleBroadcasterDisconnect,
  list,
  pauseBroadcasting,
  removeViewer,
  setupBroadcast,
  update
}
