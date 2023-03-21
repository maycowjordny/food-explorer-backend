
exports.up = knex.schema.createTable('INGREDIENT', table => {
    table.increments('id').primary()
    table.text('dish_id').references('id').inTable('DISH')
    table.text('name').notnullable()
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})

exports.down = knex.dropTable('INGREDIENT')