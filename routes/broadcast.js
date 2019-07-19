const express = require('express')
const router = express.Router()

const currentBroadcasts = {}

router.post('/update', async function(req, res) {
  const broadcastId = req.body.currentlyPlaying.broadcastId //TODO: Fix this
  const currentlyPlaying = req.body.currentlyPlaying.currentlyPlaying

  currentBroadcasts[broadcastId] = currentlyPlaying

  let progress_s = currentlyPlaying.progress_ms / 1000
  const progress_m = Math.floor(progress_s / 60)
  progress_s = Math.floor(progress_s - progress_m * 60)

  if (currentlyPlaying) {
    console.log(
      `${currentlyPlaying.item.name} by ${
        currentlyPlaying.item.artists[0].name
      } @ ${progress_m}:${progress_s}`
    )
  }
  res.send()
})

router.get('/:broadcastId', async function(req, res) {
  const broadcastId = req.params.broadcastId
  res.send(currentBroadcasts[broadcastId])
})

module.exports = router
