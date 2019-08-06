const express = require('express')
const generate = require('nanoid/async/generate')

const router = express.Router()

const broadcastServices = require('../services/broadcast.services')

/**
 * Create a new broadcast
 *
 * Returns the broadcastId
 */
router.post('/create', async (req, res) => {
  const { broadcasterName, profileImageUrl, debug = false } = req.body
  const broadcastId = await broadcastServices.create(
    broadcasterName,
    profileImageUrl,
    debug
  )
  res.send(broadcastId)
})

router.get('/list', (req, res) => {
  const broadcasts = broadcastServices.list()
  res.send(broadcasts)
})

router.put('/update', (req, res) => {
  const { broadcastId, currentlyPlaying } = req.body.currentlyPlaying //TODO: Fix this
  broadcastServices.update(broadcastId, currentlyPlaying)
  res.send()
})

router.get('/:broadcastId', async (req, res) => {
  const { broadcastId } = req.params
  const broadcast = broadcastServices.get(broadcastId)
  res.send(broadcast)
})

module.exports = router
