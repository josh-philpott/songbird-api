const { onUpdateTrigger } = require('../../knexfile')

exports.up = function(knex) {
  return knex.schema
    .createTable('viewer', function(table) {
      table.string('broadcastId').notNullable()
      table.string('id').notNullable()
      table.string('name')
      table.string('profileImageUrl')
      table.string('socketId').notNullable()
      table.timestamps(true, true)
    })
    .then(() => knex.raw(onUpdateTrigger('viewer')))
}

exports.down = function(knex) {
  return knex.schema.dropTable('viewer')
}
