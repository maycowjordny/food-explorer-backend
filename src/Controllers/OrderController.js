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

                const orderList = await knex("ORDER_DISH as OD")
                    .select(['D.price', 'OD.quantity'])
                    .innerJoin("DISH as D", "D.id", "OD.dish_id")
                    .where({ order_id: order.id })

                const orderTotal = orderList.reduce((acc, dish) => acc + dish.price * dish.quantity, 0)

                const [order_id] = await knex("ORDER").insert({
                    user_id: user_id,
                    payment,
                    amount: orderTotal,
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

            return response.json({ message: "Pedido criado com sucesso." })

        } catch (error) {
            throw new AppError(error.message)
        }
    }

    async index(request, response) {
        try {
            const user_id = request.user.id

            const order = await knex("ORDER").where({ user_id: user_id })

            await Promise.all(order.map(async order => {

                const dishes = await knex('ORDER_DISH as OD')
                    .innerJoin('DISH as D', 'D.id', 'OD.dish_id')
                    .select('D.name', 'OD.quantity', 'D.price')
                    .where({ order_id: order.id })

                order.dishes = dishes

            }))
            return response.json(order)

        } catch (error) {

            throw new AppError(error.message)
        }
    }

    async updateStatus(request, response) {

        try {
            const orderId = request.params.id
            const { status } = request.body

            if (!Object.values(orderStatus).includes(status)) {

                throw new AppError("Status do pedido inválido")
            }

            await knex("ORDER").where({ id: orderId }).update({
                status,
                updated_at: knex.fn.now()
            })

            return response.json({ message: "Status atualizado com sucesso." })

        } catch (error) {

            throw new AppError(error.message)
        }

    }
}

module.exports = OrderController