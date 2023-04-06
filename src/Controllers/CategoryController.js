const knex = require("../database/knex")
const AppError = require("../utils/AppError")

class CategoryController {
    async index(request, response) {

        try {
            const category = await knex("CATEGORY").select(['CATEGORY.id', 'CATEGORY.name'])
            return response.json(category)

        } catch (error) {
            throw new AppError(error.message)

        }


    }
}

module.exports = CategoryController