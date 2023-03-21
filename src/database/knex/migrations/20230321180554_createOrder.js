
exports.up = knex.schema.createTable('DISH', table => {
    table.increments('id').primary()
    table.text('name').notnullable()
    table.text('category_id').references('id').inTable('CATEGORY').notnullable()
    table.text('description')
    table.text('image')
    table.decimal('price', 8, 2).notnullable
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated').default(knex.fn.now())
})



exports.down = knex.schema.dropTable('DISH')
