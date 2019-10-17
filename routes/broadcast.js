const express = require('express')
const router = express.Router()

const broadcastActions = require('../services/broadcast.actions')

router.get('/list', async (req, res) => {
  const broadcastIds = await broadcastActions.list() //TODO: Add filter for listing inactive broadcasts
  res.send(broadcastIds)
})

router.put('/update', async (req, res) => {
  const { broadcastId, currentlyPlaying } = req.body.currentlyPlaying //TODO: Fix this
  await broadcastActions.update(broadcastId, currentlyPlaying)
  res.send()
})

router.get('/:broadcastId', async (req, res) => {
  const { broadcastId } = req.params
  const broadcast = await broadcastActions.getById(broadcastId)
  res.send(broadcast)
})

module.exports = router
