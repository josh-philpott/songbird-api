const knex = require('knex')({
  client: 'pg',
  connection: {
    host: '127.0.0.1',
    user: 'soundbridge_app',
    password: 'password',
    database: 'soundbridge'
  }
})

module.exports = knex
