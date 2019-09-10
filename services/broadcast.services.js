const generate = require('nanoid/async/generate')
const { find, remove, flatMap } = require('lodash')

//TODO: Need to come up with a legitimate storage mechanism for broadcasts
const broadcasts = {}

const create = async (
  spotifyUserId,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  const broadcastId = spotifyUserId

  broadcasts[broadcastId] = {
    broadcastId,
    broadcasterName,
    profileImageUrl,
    lastUpdated: new Date(),
    socketId,
    viewers: []
  }

  console.log('created!!!')
  console.log(broadcasts[broadcastId])
  console.log('-------------end create--------------')

  return broadcastId
}

const get = broadcastId => {
  return broadcasts[broadcastId]
}

const list = () => {
  return Object.keys(broadcasts)
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
  if (broadcasts[broadcastId]) {
    prev = broadcasts[broadcastId].currentlyPlaying
    prevUpdateTime = broadcasts[broadcastId].lastUpdated
  }
  const updateListeners = shouldUpdateListeners(
    prev,
    prevUpdateTime,
    currentlyPlaying
  )

  broadcasts[broadcastId] = {
    ...broadcasts[broadcastId],
    currentlyPlaying,
    status: 'live',
    lastUpdated: new Date()
  }

  return updateListeners
}

const handleBroadcasterDisconnect = broadcastId => {
  broadcasts[broadcastId] = {
    ...broadcasts[broadcastId],
    status: 'offline',
    lastUpdated: new Date()
  }
}

const getBySocketId = socketId => {
  const broadcast = find(broadcasts, { socketId })
  const broadcastId = broadcast ? broadcast.broadcastId : null
  return broadcastId
}

const addViewer = (broadcastId, socketId, id, name, profileImageUrl) => {
  const broadcast = broadcasts[broadcastId]
  if (broadcast) {
    if (!broadcast.viewers) {
      broadcast.viewers = []
    }

    broadcast.viewers.push({
      socketId,
      id,
      name,
      profileImageUrl
    })
    return broadcast.viewers
  }
}

const removeViewer = socketId => {
  //find broadcast where the viewers array contains an object with 'id'
  const broadcastWithViewer = find(broadcasts, broadcast => {
    const viewer = find(broadcast.viewers, { socketId })
    return !!viewer
  })

  if (broadcastWithViewer) {
    const removedViewer = remove(broadcastWithViewer.viewers, { socketId })
    console.log('removed ', removedViewer)

    console.log('start broadcast----------------------')
    console.log(broadcastWithViewer)
    console.log('end  broadcast------------------------')
    return broadcastWithViewer
  }
}

module.exports = {
  addViewer,
  removeViewer,
  create,
  get,
  list,
  update,
  getBySocketId,
  handleBroadcasterDisconnect
}
