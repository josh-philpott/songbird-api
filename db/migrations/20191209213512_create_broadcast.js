const { onUpdateTrigger } = require('../../knexfile')

exports.up = function(knex) {
  return knex.schema
    .createTable('broadcast', function(table) {
      table
        .string('id')
        .notNullable()
        .primary()
      table.string('broadcasterName')
      table.string('profileImageUrl')
      table.string('socketId')
      table.boolean('isBroadcasterConnected')
      table.json('currentlyPlaying')
      table.boolean('isBroadcasting')
      table.timestamps(true, true)
    })
    .then(() => knex.raw(onUpdateTrigger('broadcast')))
}

exports.down = function(knex) {
  return knex.schema.dropTable('broadcast')
}
