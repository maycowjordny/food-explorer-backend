
exports.up = knex.schema.createTable('ORDER', table => {
    table.increments('id').primary()
    table.text('user_id').references('id').inTable('USERS')
    table.decimal('amount', 8, 2)
    table.text('status')
    table.text('payment').notnullable()
    table.timestamps('created_at').default(knex.fn.now())
    table.timestamps('updated_at').default(knex.fn.now())
})


exports.down = knex.schema.dropTable('ORDER')
