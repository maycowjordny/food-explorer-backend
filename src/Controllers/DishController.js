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

}

module.exports = DishController