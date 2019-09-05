const generate = require('nanoid/async/generate')
const { find, flatMap } = require('lodash')

//TODO: Need to come up with a legitimate storage mechanism for broadcasts
const currentBroadcasts = {}

const create = async (
  spotifyUserId,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  const broadcastId = spotifyUserId

  currentBroadcasts[broadcastId] = {
    broadcastId,
    broadcasterName,
    profileImageUrl,
    lastUpdated: new Date(),
    socketId
  }

  return broadcastId
}

const get = broadcastId => {
  return currentBroadcasts[broadcastId]
}

const list = () => {
  return Object.keys(currentBroadcasts)
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

const update = (broadcastId, currentlyPlaying) => {
  //determine if we need to update listeners
  let prev, prevUpdateTime
  if (currentBroadcasts[broadcastId]) {
    prev = currentBroadcasts[broadcastId].currentlyPlaying
    prevUpdateTime = currentBroadcasts[broadcastId].lastUpdated
  }
  const updateListeners = shouldUpdateListeners(
    prev,
    prevUpdateTime,
    currentlyPlaying
  )

  currentBroadcasts[broadcastId] = {
    ...currentBroadcasts[broadcastId],
    currentlyPlaying,
    status: 'live',
    lastUpdated: new Date()
  }

  return updateListeners
}

const handleBroadcasterDisconnect = broadcastId => {
  currentBroadcasts[broadcastId] = {
    ...currentBroadcasts[broadcastId],
    status: 'offline',
    lastUpdated: new Date()
  }
}

const getBySocketId = socketId => {
  const broadcast = find(currentBroadcasts, { socketId })
  const broadcastId = broadcast ? broadcast.broadcastId : null
  return broadcastId
}

module.exports = {
  create,
  get,
  list,
  update,
  getBySocketId,
  handleBroadcasterDisconnect
}
