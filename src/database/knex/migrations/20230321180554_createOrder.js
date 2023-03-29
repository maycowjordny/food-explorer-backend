
exports.up = knex => knex.schema.createTable('DISH', table => {
    table.increments("id");
    table.text("name").notNullable();
    table.text("description");
    table.text("category_id").references('id').inTable("CATEGORY").notNullable();
    table.text("image");
    table.decimal("price", 8, 2).notNullable();
    table.timestamp("created_at").default(knex.fn.now());
    table.timestamp("updated_at").default(knex.fn.now());
})



exports.down = knex => knex.schema.dropTable('DISH')
