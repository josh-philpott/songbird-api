const cors = require('cors')
const dotenv = require('dotenv').config()
const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const session = require('express-session')
const logger = require('morgan')

const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const spotifyRouter = require('./routes/spotify')
const broadcastRouter = require('./routes/broadcast')

const app = express()

app.listen(3002)

app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/api', indexRouter)
app.use('/api/users', usersRouter)
app.use('/api/spotify', spotifyRouter)
app.use('/api/broadcast', broadcastRouter)

module.exports = app
