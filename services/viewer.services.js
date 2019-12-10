const knex = require('./postgres.services')
const logger = require('../logger')

const getViewersByBroadcastId = async broadcastId => {
  return await knex('viewer').where({ broadcastId })
}

const addViewerToBroadcast = async (
  broadcastId,
  id,
  name,
  profileImageUrl,
  socketId
) => {
  return await knex('viewer').insert({
    broadcastId,
    id,
    name,
    profileImageUrl,
    socketId
  })
}

const removeViewerBySocketId = async socketId => {
  return await knex('viewer')
    .where({ socketId })
    .returning('*')
    .delete()
}

module.exports = {
  addViewerToBroadcast,
  getViewersByBroadcastId,
  removeViewerBySocketId
}
