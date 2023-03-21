
exports.up = knex.schema.createTable('ORDER_DISH', table => {
    table.increments('id').primary()
    table.text('order_id').references('id').inTable('ORDER')
    table.text('dish_id').references('id').inTable('DISH')
    table.text('quantity').notnullable()

})


exports.down = knex.schema.dropTable('ORDER_DISH')
