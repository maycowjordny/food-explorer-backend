
exports.up = knex => knex.schema.createTable('DISH', table => {
    table.increments('id').primary()
    table.text('name').notNullable()
    table.integer('category_id').references('id').inTable('CATEGORY').notNullable()
    table.text('description')
    table.text('image')
    table.decimal('price', 8, 2).notNullable()
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated').default(knex.fn.now())
})



exports.down = knex => knex.schema.dropTable('DISH')
