
exports.up = knex => knex.schema.createTable('INGREDIENT', table => {
    table.increments('id')
    table.integer('dish_id').references('id').inTable('DISH').onDelete('CASCADE').notNullable()
    table.text('name').notNullable()
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})

exports.down = knex => knex.dropTable('INGREDIENT')