const axios = require('axios')
const express = require('express')
const router = express.Router()
const request = require('request')
const querystring = require('querystring')

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET

const stateKey = 'spotify_auth_state'

const redirectUri = 'http://localhost:3002/spotify/callback' // Your redirect uri

const generateRandomString = length => {
  var text = ''
  var possible =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (var i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}

router.get('/login', (req, res, next) => {
  var state = generateRandomString(16)
  var stateKey = 'spotify_auth_state'

  res.cookie(stateKey, state)

  // your application requests authorization
  var scope = 'user-read-private user-read-email'
  res.send(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: redirectUri,
        state: state
      })
  )
})

/**
 * Grab an access token and refresh token for a spotify user
 */
router.post('/getAccessToken', async function(req, res) {
  var code = req.body.code || null
  var state = req.body.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch'
        })
    )
  } else {
    res.clearCookie(stateKey)

    const urlParams = querystring.stringify({
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })

    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        urlParams,
        {
          headers: {
            Authorization:
              'Basic ' +
              new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'),
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )
      res.send(response.data)
    } catch (error) {
      console.log(error)
      res.redirect(
        '/#' +
          querystring.stringify({
            error: 'invalid_token'
          })
      )
    }
  }
})

module.exports = router
