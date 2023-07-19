const knex = require("../database/knex");
const AppError = require("../utils/AppError");
const DiskStorage = require("../providers/DiskStorage")

class DishController {
    async create(request, response) {
        try {

            const { name, description, category_id, price, ingredients } = request.body;
            const imageDish = request.file ? request.file.filename : null;

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
            const dish = await knex("DISH").where({ id }).first()
            const ingredients = await knex("INGREDIENT").where({ dish_id: id }).orderBy("name")

            return response.json({
                ...dish,
                ingredients
            })

        } catch (error) {
            throw new AppError(error.message, 500)
        }
    }

    async delete(request, response) {
        try {

            const { id } = request.params;
            await knex("DISH")
                .where({ id })
                .delete();

            return response.json({ message: "Prato deletado com sucesso" });
        } catch (error) {
            throw new AppError(error.message, 500);
        }
    }


    async update(request, response) {
        try {
            const dishID = request.params.id
            const { name, description, category_id, price, ingredients } = request.body
            const imageDish = request.file ? request.file.filename : null;

            const diskStorage = new DiskStorage()

            const dish = await knex("DISH").where({ id: dishID }).first()

            if (!dish) {
                throw new AppError("Prato não encontrado", 404);
            }

            if (dish.image && imageDish != null) {
                await diskStorage.deleteFile(dish.image);
            }

            await knex.transaction(async trx => {

                await trx("DISH").where({ id: dishID }).update({
                    name,
                    description,
                    category_id,
                    price,
                    image: imageDish ? imageDish : dish.image,
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

    async index(request, response) {

        try {
            const { name, ingredients } = request.query;
            const userId = request.user.id;

            let dishes = await knex("DISH as d")
                .select([
                    "d.id",
                    "d.name",
                    "d.description",
                    "d.category_id",
                    "d.image",
                    "d.price",
                    knex.raw("CASE WHEN f.id IS NULL THEN false ELSE true END AS is_favorite")
                ])
                .distinct()
                .where(function () {
                    this.where("d.name", "like", `%${name}%`)
                        .orWhere("I.name", "like", `%${ingredients}%`);
                })
                .leftJoin("INGREDIENT as I", "d.id", "I.dish_id")
                .leftJoin("FAVORITE as f", function () {
                    this.on("d.id", "=", "f.dish_id")
                        .andOn("f.user_id", "=", userId);
                })
                .orderBy('d.name');

            return response.json(dishes);
        } catch (error) {
            throw new AppError(error.message);
        }
    }

}

module.exports = DishController