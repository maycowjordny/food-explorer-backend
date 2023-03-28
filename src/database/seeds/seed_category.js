exports.seed = async function (knex) {
    await knex("CATEGORY").del()
    await knex("CATEGORY").insert([
        { name: "Pratos principais" },
        { name: "Sobremesas" },
        { name: "Bebidas" }
    ])
}