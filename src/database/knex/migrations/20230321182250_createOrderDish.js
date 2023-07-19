
exports.up = knex => knex.schema.createTable('ORDER_DISH', table => {
    table.increments('id')
    table.integer('order_id').references('id').inTable('ORDER')
    table.integer('dish_id').references('id').inTable('DISH')
    table.text('quantity').notNullable()

})


exports.down = knex => knex.schema.dropTable('ORDER_DISH')
