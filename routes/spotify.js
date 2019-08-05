const axios = require('axios')
const express = require('express')
const router = express.Router()
const request = require('request')
const querystring = require('querystring')

const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, APP_BASE_URL } = process.env

const stateKey = 'spotify_auth_state'

const redirectUri = `${APP_BASE_URL}/spotify/callback` // Your redirect uri

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

  res.cookie(stateKey, state, {
    httpOnly: false,
    signed: false,
    domain: 'songbridge-api.herokuapp.com'
  })

  // your application requests authorization
  var scope =
    'user-read-private user-read-email streaming user-read-currently-playing user-read-playback-state user-modify-playback-state'
  res.send(
    'https://accounts.spotify.com/authorize?' +
      querystring.stringify({
        response_type: 'code',
        client_id: SPOTIFY_CLIENT_ID,
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
  //TODO: CORS issues trying to set the cookie and retrieve it here

  /*var state = req.body.state || null
  var storedState = req.cookies ? req.cookies[stateKey] : null

  if (state === null || state !== storedState) {
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'state_mismatch'
        })
    )
  } else {
    res.clearCookie(stateKey)*/

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
            new Buffer(
              SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
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
})

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refresh_token } = req.body

    const urlParams = querystring.stringify({
      grant_type: 'refresh_token',
      refresh_token
    })

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      urlParams,
      {
        headers: {
          Authorization:
            'Basic ' +
            new Buffer(
              SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET
            ).toString('base64'),
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    res.send(response.data)
  } catch (err) {
    console.log(err)
    res.redirect(
      '/#' +
        querystring.stringify({
          error: 'invalid_token'
        })
    )
  }
})

module.exports = router
