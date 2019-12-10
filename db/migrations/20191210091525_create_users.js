const { onUpdateTrigger } = require('../../knexfile')

exports.up = function(knex) {
  return knex.schema
    .createTable('users', function(table) {
      table.string('broadcastId').notNullable()
      table.string('id').notNullable()
      table.string('name')
      table.time('profileImageUrl')
      table.string('socketId').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(onUpdateTrigger('users')))
}

exports.down = function(knex) {
  return knex.schema.dropTable('users')
}
