const knex = require('../database/knex')
const paymentMethod = require("../enum/PaymentMethod")
const orderStatus = require("../enum/OrderStatus")
const AppError = require('../utils/AppError')

class OrderController {
    async create(request, response) {

        try {
            const user_id = request.user.id
            const { payment, dishes } = request.body

            if (!Object.values(paymentMethod).includes(payment)) {

                throw new AppError("Método de pagamento inválido.")
            }

            const orders = await knex("ORDER")
                .select(['ORDER.id', 'ORDER.user_id', 'ORDER.amount'])
                .where({ user_id: user_id })

            await Promise.all(orders.map(async order => {

                const orderlist = await knex("ORDER_DISH")
                    .select(['DISH.price', 'ORDER_DISH.quantity'])
                    .innerJoin("DISH", "DISH.id", "ORDER_DISH.dish_id")
                    .where({ order_id: order.id })

                const total = orderlist.reduce((acc, dish) => acc + dish.price * dish.quantity, 0)

                const [order_id] = await knex("ORDER").insert({
                    user_id: user_id,
                    payment,
                    amount: total,
                    status: orderStatus.PENDING
                })

                for (const dish of dishes) {
                    await knex("ORDER_DISH").insert({
                        order_id,
                        dish_id: dish.id,
                        quantity: dish.quantity
                    })
                }

            }))
            return response.json({ message: "Pedido criado" })

        } catch (error) {
            throw new AppError(error.message)
        }
    }
}

module.exports = OrderController