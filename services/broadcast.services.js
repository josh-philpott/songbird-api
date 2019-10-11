const knex = require('./postgres.services')

const insertBroadcasterInfo = async (
  id,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  return await knex('broadcasts').insert({
    id,
    broadcasterName,
    profileImageUrl,
    socketId,
    lastUpdated: new Date()
  })
}

const updateBroadcasterInfo = async (
  id,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  return await knex('broadcasts')
    .where({ id })
    .update({
      broadcasterName,
      profileImageUrl,
      socketId,
      lastUpdated: new Date()
    })
}

const updateIsLive = async (id, isLive) => {
  return await knex('broadcasts')
    .where({ id })
    .update({ isLive, lastUpdated: new Date() })
}

const getById = async id => {
  return await knex('broadcasts')
    .where({
      id
    })
    .first()
}

const getCurrentlyPlayingById = async id => {
  knex('broadcasts')
    .where({ id })
    .select('currentlyPlaying')
    .first()
}

const getIds = async () => {
  return await knex('broadcasts').select('id')
}

const getBySocketId = async socketId => {
  // There should only be one broadcast per socketId.
  return await knex('broadcasts')
    .where({ socketId })
    .first()
}

module.exports = {
  getById,
  getBySocketId,
  getCurrentlyPlayingById,
  getIds,
  insertBroadcasterInfo,
  updateBroadcasterInfo,
  updateIsLive
}
