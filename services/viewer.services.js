const knex = require('./postgres.services')

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
  console.log(`deleting viewers w/ socketId: ${socketId}`)
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
