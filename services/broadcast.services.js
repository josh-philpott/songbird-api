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

const updateIsBroadcasterConnected = async (id, isBroadcasterConnected) => {
  return await knex('broadcasts')
    .where({ id })
    .update({ isBroadcasterConnected, lastUpdated: new Date() })
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

const updateCurrentlyPlaying = async (id, currentlyPlaying) => {
  const _currentlyPlaying = currentlyPlaying ? currentlyPlaying : null

  if (!currentlyPlaying)
    await knex('broadcasts')
      .where({ id })
      .update({
        isBroadcasterConnected: true,
        isBroadcasting: true,
        currentlyPlaying: _currentlyPlaying,
        lastUpdated: new Date()
      })
}

const updateIsBroadcasting = async (id, isBroadcasting) => {
  await knex('broadcasts')
    .where({ id })
    .update({
      isBroadcasting
    })
}

module.exports = {
  getById,
  getBySocketId,
  getCurrentlyPlayingById,
  getIds,
  insertBroadcasterInfo,
  updateBroadcasterInfo,
  updateCurrentlyPlaying,
  updateIsBroadcasterConnected,
  updateIsBroadcasting
}
