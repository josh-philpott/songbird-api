const generate = require('nanoid/async/generate')

//TODO: Need to come up with a legitimate storage mechanism for broadcasts
const currentBroadcasts = {}

const create = async (broadcasterName, profileImageUrl, debug) => {
  const broadcastId = debug
    ? 'debugid'
    : await generate('0123456789abcdefghijklmnopqrstuvwxyz', 6)

  currentBroadcasts[broadcastId] = {
    broadcasterName,
    profileImageUrl,
    lastUpdated: new Date()
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

module.exports = {
  create,
  get,
  list,
  update
}
