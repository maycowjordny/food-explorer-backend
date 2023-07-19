
exports.up = knex => knex.schema.createTable('USERS', table => {
    table.increments('id').primary()
    table.text('name').notNullable()
    table.text('email').notNullable()
    table.text('password', 6).notNullable()
    table.boolean('is_admin').defaultTo(false)
    table.text('avatar')
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())

})



exports.down = knex => knex.schema.dropTable('USERS')