const knex = require("knex");

class DishController {
    async create(request, response) {
        try {
            const { name, description, price, image, category_id } = request.body

        } catch (error) {


        }
    }

}

module.exports = DishController