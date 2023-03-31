const { Knex } = require("knex");
const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class DishController {
    async create(request, response) {
        try {

            const { name, description, category_id, price, image, ingredients } = request.body;
            await knex("DISH").insert({
                name,
                description,
                category_id,
                price,
                image
            }).then(async result => {
                const addIngredients = ingredients.map(ingredient => {
                    return {
                        dish_id: result[0],
                        name: ingredient
                    }
                })

                await knex("INGREDIENT").insert(addIngredients)
            });

            return response.status(200).json({ message: "Prato criado com sucesso" });

        } catch (error) {

            throw new AppError(error.message, 500)

        }
    }

    async show(request, response) {
        try {
            const { id } = request.params
            const ingredients = await knex("INGREDIENT").where({ id }).orderBy("name")
            const dish = await knex("DISH").where({ id }).first()

            return response.json({ dish, ingredients })

        } catch (error) {
            throw new AppError(error.message, 500)
        }
    }

    async delete(request, response) {
        try {
            const id = request.params.id

            await knex("DISH").where({ id: id }).delete();

            return response.json({ message: "Prato deletado" })

        } catch (error) {
            throw new AppError(error.message, 500)
        }
    }

    async updtade(request, response) {
        try {
            const dishID = request.params.id
            const { name, description, category_id, price, image, ingredients } = request.body

            await knex("DISH").where({ id: dishID }).update({
                name,
                description,
                category_id,
                price,
                image,
                updated_at: knex.fn.now()
            })

            await knex("INGREDIENT").where({ dish_id: dishID }).delete()

            const updateIngredients = ingredients.map(ingredient => {
                return {
                    dish_id: dishID,
                    name: ingredient
                }
            })

            await knex("INGREDIENT").insert(updateIngredients)

            return response.json("Prato atualizado ")

        } catch (error) {
            throw new AppError(error.message)
        }
    }

}

module.exports = DishController