const knex = require('../database/knex')
const orderStatus = require("../enum/OrderStatus")
const paymentMethod = require("../enum/PaymentMethod")
const AppError = require('../utils/AppError')

class OrderController {
    async create(request, response) {

        try {
            const userId = request.user.id;
            const { dishes } = request.body;

            const ordersExists = await knex("ORDER")
                .where({ user_id: userId })
                .where({ status: orderStatus.PENDING });

            if (!ordersExists.length) {
                await knex.transaction(async (trx) => {
                    const [order_id] = await trx("ORDER").insert({
                        user_id: userId,
                        amount: 0,
                        payment: paymentMethod.CREDIT_CARD,
                        status: orderStatus.PENDING
                    });

                    for (const dish of dishes) {
                        await trx("ORDER_DISH").insert({
                            order_id,
                            dish_id: dish.id,
                            quantity: dish.quantity
                        });
                    }

                    const orderDishes = await trx("ORDER_DISH")
                        .select(['DISH.price', 'ORDER_DISH.quantity'])
                        .innerJoin("DISH", "DISH.id", "ORDER_DISH.dish_id")
                        .where({ order_id })

                    let total = 0;

                    for (const dish of orderDishes) {
                        total += dish.price * dish.quantity;
                    }

                    await trx("ORDER").where({ id: order_id }).update({
                        amount: total,
                    });

                    return response.json({ message: "Pedido criado com sucesso!", order_id });
                });

            } else {
                await knex.transaction(async (trx) => {
                    const orderId = ordersExists[0].id;
                    for (const dish of dishes) {
                        const existingOrderDish = await trx("ORDER_DISH")
                            .select("quantity")
                            .where({ order_id: orderId })
                            .andWhere({ dish_id: dish.id })
                            .first();

                        if (existingOrderDish) {
                            const newQuantity = Number(existingOrderDish.quantity) + Number(dish.quantity);
                            await trx("ORDER_DISH")
                                .where({ order_id: orderId })
                                .andWhere({ dish_id: dish.id })
                                .update({ quantity: newQuantity });
                        } else {
                            await trx("ORDER_DISH").insert({
                                order_id: orderId,
                                dish_id: dish.id,
                                quantity: dish.quantity,
                            });
                        }
                    }

                    const orderDishes = await trx("ORDER_DISH")
                        .select(['DISH.price', 'ORDER_DISH.quantity'])
                        .innerJoin("DISH", "DISH.id", "ORDER_DISH.dish_id")
                        .where({ order_id: orderId })

                    let total = 0;

                    for (const dish of orderDishes) {
                        total += dish.price * dish.quantity;
                    }

                    await trx("ORDER").where({ id: orderId }).update({
                        amount: total,
                    });

                    return response.json({ message: "Pedido atualizado com sucesso!", order_id: orderId });
                });
            }

        } catch (error) {
            throw new AppError(error.message, 500);
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

    async updatePaymentMethod(request, response) {
        const orderId = request.params.id;
        const { payment } = request.body;

        try {
            if (!Object.values(paymentMethod).includes(payment)) {

                return response.status(400).json({ message: "Metodo de pagamento inválido" });
            }

            await knex("ORDER").update({ payment, updated_at: knex.fn.now() }).where({ id: orderId })

            return response.status(200).json({ message: "Metodo de pagamento atualizado com sucesso" })
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