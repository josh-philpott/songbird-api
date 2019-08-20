const generate = require('nanoid/async/generate')
const { find, flatMap } = require('lodash')

//TODO: Need to come up with a legitimate storage mechanism for broadcasts
const currentBroadcasts = {}

const create = async (broadcasterName, profileImageUrl, debug, socketId) => {
  const broadcastId = debug
    ? 'debugid'
    : await generate('0123456789abcdefghijklmnopqrstuvwxyz', 6)

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

const update = (broadcastId, currentlyPlaying) => {
  currentBroadcasts[broadcastId] = {
    ...currentBroadcasts[broadcastId],
    currentlyPlaying,
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
  getBySocketId
}
