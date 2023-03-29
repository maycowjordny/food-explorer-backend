const knex = require("../database/knex")

class IngredientsController {
    async index(request, response) {

        try {
            const dish_id = request.params.id
            const ingredients = await knex('INGREDIENT').where({ dish_id })

            return response.json(ingredients)
        } catch (error) {
            return response.status(500).json({ message: "Internal server error" })
        }

    }
}

module.exports = IngredientsController