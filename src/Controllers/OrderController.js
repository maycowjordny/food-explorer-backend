const knex = require('knex')

class OrderController {
    async create(request, response) {
        const user_id = request.user.id
        const { amount, dishes, payment } = request.body

        try {

        } catch (error) {

        }
    }
}