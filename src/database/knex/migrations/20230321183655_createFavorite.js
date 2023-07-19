
exports.up = knex => knex.schema.createTable('FAVORITE', table => {
    table.increments('id')
    table.integer('user_id').references('id').inTable('USERS')
    table.integer('dish_id').references('id').inTable('DISH')
    table.timestamp('created_at').default(knex.fn.now())
    table.timestamp('updated_at').default(knex.fn.now())
})

exports.down = knex => knex.dropTable('FAVORITE')
