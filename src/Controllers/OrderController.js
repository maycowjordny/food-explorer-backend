const knex = require('../database/knex')
const paymentMethod = require("../enum/PaymentMethod")
const orderStatus = require("../enum/OrderStatus")

class OrderController {
    async create(request, response) {

        try {
            const user_id = request.user.id
            const { amount, status, payment } = request.body




        } catch (error) {

        }
    }
}