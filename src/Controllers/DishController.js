const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage")

class DishController {
    async create(request, response) {
        try {

            const { name, description, category_id, price, ingredients } = request.body;
            const imageDish = request.file.filename

            await knex("DISH").insert({
                name,
                description,
                category_id,
                price,
                image: imageDish
            }).then(async result => {
                const splitIngredients = ingredients[0].split(",")

                const addIngredients = splitIngredients.map(ingredient => {
                    return {
                        dish_id: result[0],
                        name: ingredient
                    }
                })

                await knex("INGREDIENT").insert(addIngredients)
            });

            return response.status(200).json({ message: "Prato criado com sucesso." });

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

            return response.json({ message: "Prato deletado com sucesso." })

        } catch (error) {
            throw new AppError(error.message, 500)
        }
    }

    async update(request, response) {
        try {
            const dishID = request.params.id
            const { name, description, category_id, price, ingredients } = request.body
            const imageDish = request.file.filename

            const diskstorage = new DiskStorage()

            const dish = await knex("DISH").where({ id: dishID }).first()

            if (!dish) {
                throw new AppError("Prato não encontrado", 404)
            }

            if (dish.image) {
                await diskstorage.deleteFile(dish.image)
            }

            await knex.transaction(async trx => {

                await trx("DISH").where({ id: dishID }).update({
                    name,
                    description,
                    category_id,
                    price,
                    image: imageDish,
                    updated_at: knex.fn.now()
                })

                await trx("INGREDIENT").where({ dish_id: dishID }).delete()

                const splitIngredients = ingredients[0].split(",")
                const updateIngredients = splitIngredients.map(ingredient => {
                    return {
                        dish_id: dishID,
                        name: ingredient
                    }
                })

                await trx("INGREDIENT").insert(updateIngredients)

            })


            return response.json({ message: "Prato atualizado com sucesso." })

        } catch (error) {
            throw new AppError(error.message)
        }
    }

}

module.exports = DishController