const knex = require('./postgres.services')
const logger = require('../logger')

const getViewersByBroadcastId = async broadcastId => {
  return await knex('viewers').where({ broadcastId })
}

const addViewerToBroadcast = async (
  broadcastId,
  id,
  name,
  profileImageUrl,
  socketId
) => {
  return await knex('viewers').insert({
    broadcastId,
    id,
    name,
    profileImageUrl,
    socketId
  })
}

const removeViewerBySocketId = async socketId => {
  return await knex('viewers')
    .where({ socketId })
    .returning('*')
    .delete()
}

module.exports = {
  addViewerToBroadcast,
  getViewersByBroadcastId,
  removeViewerBySocketId
}
