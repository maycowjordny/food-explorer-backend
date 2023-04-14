const knex = require('../database/knex')
const orderStatus = require("../enum/OrderStatus")
const paymentMethod = require("../enum/PaymentMethod")
const AppError = require('../utils/AppError')

class OrderController {
    async create(request, response) {

        try {
            const user_id = request.user.id
            const { dishes } = request.body
            let orderList = []

            const [order_id] = await knex("ORDER").insert({
                user_id: user_id,
                payment: null,
                amount: 0,
                status: orderStatus.PENDING
            })

            for (const dish of dishes) {
                await knex("ORDER_DISH").insert({
                    order_id,
                    dish_id: dish.id,
                    quantity: dish.quantity
                })
            }

            const orders = await knex("ORDER")
                .select(['ORDER.id', 'ORDER.user_id', 'ORDER.amount'])
                .where({ user_id: user_id })

            await Promise.all(orders.map(async order => {

                orderList = await knex("ORDER_DISH as OD")
                    .select(['D.price', 'OD.quantity'])
                    .innerJoin("DISH as D", "D.id", "OD.dish_id")
                    .where({ order_id: order.id })

            }))

            const orderTotal = orderList.reduce((acc, dish) => acc + dish.price * dish.quantity, 0)

            await knex("ORDER").update({ amount: orderTotal }).where({ user_id: user_id }).where({ id: order_id })

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

    async updateOrder(request, response) {
        try {
            const orderId = request.params.id;
            const { dishes, payment } = request.body;


            for (const dish of dishes) {
                const order_dish = await knex("ORDER_DISH")
                    .where({
                        order_id: orderId,
                        dish_id: dish.id
                    }).first()

                await knex("ORDER_DISH")
                    .where({
                        order_id: orderId,
                        dish_id: dish.id
                    })
                    .update({
                        quantity:
                            Number(dish.quantity) ?
                                Number(dish.quantity) + Number(order_dish.quantity)
                                :
                                Number(order_dish.quantity)
                    })
            }

            let orderTotal = 0

            const orderDishes = await knex("ORDER_DISH as OD")
                .select(['D.price', 'OD.quantity'])
                .innerJoin("DISH as D", "D.id", "OD.dish_id")
                .where({ order_id: orderId })

            orderTotal = orderDishes.reduce((acc, dish) => acc + dish.price * dish.quantity, 0)


            if (payment == undefined) {
                await knex("ORDER").update({
                    amount: orderTotal,
                    payment: null
                }).where({ id: orderId })
            } else {
                if (!Object.values(paymentMethod).includes(payment)) {
                    throw new AppError("Método de pagamento inválido")
                }

                await knex("ORDER").update({
                    payment
                }).where({ id: orderId })
            }

            return response.status(200).json({ message: "Pedido atualizado com sucesso." });


        } catch (error) {
            throw new AppError(error.message, 500);
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