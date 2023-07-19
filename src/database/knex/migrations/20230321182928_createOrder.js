
exports.up = knex => knex.schema.createTable('ORDER', table => {
    table.increments('id')
    table.integer('user_id').references('id').inTable('USERS').notNullable()
    table.decimal('amount', 8, 2)
    table.text('status')
    table.text('payment')
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})


exports.down = knex => knex.schema.dropTable('ORDER')
