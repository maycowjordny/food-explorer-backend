
exports.up = knex.schema.createTable('CATEGORY', table => {
    table.increments('id').primary()
    table.text('name').unique()
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})


exports.down = knex.schema.dropTable('CATEGORY')
