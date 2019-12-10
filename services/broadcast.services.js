const knex = require('./postgres.services')

const insertBroadcasterInfo = async (
  id,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  return await knex('broadcast').insert({
    id,
    broadcasterName,
    profileImageUrl,
    socketId
  })
}

const updateBroadcasterInfo = async (
  id,
  broadcasterName,
  profileImageUrl,
  socketId
) => {
  return await knex('broadcast')
    .where({ id })
    .update({
      broadcasterName,
      profileImageUrl,
      socketId
    })
}

const updateIsBroadcasterConnected = async (id, isBroadcasterConnected) => {
  return await knex('broadcast')
    .where({ id })
    .update({ isBroadcasterConnected })
}

const getById = async id => {
  return await knex('broadcast')
    .where({
      id
    })
    .first()
}

const getCurrentlyPlayingById = async id => {
  knex('broadcast')
    .where({ id })
    .select('currentlyPlaying')
    .first()
}

const getIds = async () => {
  return await knex('broadcast').select('id')
}

const getBySocketId = async socketId => {
  // There should only be one broadcast per socketId.
  return await knex('broadcast')
    .where({ socketId })
    .first()
}

const updateCurrentlyPlaying = async (id, currentlyPlaying) => {
  const _currentlyPlaying = currentlyPlaying ? currentlyPlaying : null

  await knex('broadcast')
    .where({ id })
    .update({
      isBroadcasterConnected: true,
      isBroadcasting: true,
      currentlyPlaying: _currentlyPlaying
    })
}

const updateIsBroadcasting = async (id, isBroadcasting) => {
  await knex('broadcast')
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
