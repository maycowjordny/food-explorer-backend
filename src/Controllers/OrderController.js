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
                    .select('D.name', 'OD.quantity', 'D.id', 'D.price', 'D.image')
                    .innerJoin('DISH as D', 'D.id', 'OD.dish_id')
                    .where({ order_id: order.id })

                order.dishes = dishes

            }))
            return response.json(order)

        } catch (error) {

            throw new AppError(error.message)
        }
    }

    async show(request, response) {
        const userId = request.user.id;
        const orderId = request.params.id;

        try {
            const orders = await knex("ORDER").where({ user_id: userId, id: orderId })

            await Promise.all(orders.map(async order => {
                const dishes = await knex("ORDER_DISH as OD")
                    .select("D.id", "D.name", "OD.quantity", "D.price", "D.image")
                    .innerJoin("DISH as D", "D.id", "OD.dish_id")
                    .where({ order_id: order.id })

                order.dishes = dishes;
            }));

            return response.json(orders);
        } catch (error) {

            throw new AppError(error.message, 500);
        }
    }

    async removeDishOrder(request, response) {
        try {
            const orderId = request.params.id;
            const { dishes } = request.body;


            const order = await knex("ORDER")
                .where({
                    id: orderId,
                    user_id: request.user.id,
                    status: orderStatus.PENDING
                })
                .first();

            if (!order) {
                return response.status(404).json({ message: "Ordem não encontrada ou não pertence ao usuário correto." });
            }

            const orderDish = await knex("ORDER_DISH")
                .where({
                    order_id: orderId,
                    dish_id: dishes[0].id
                })
                .first();

            if (!orderDish) {
                return response.status(404).json({ message: "Prato não encontrado na ordem." });
            }

            await knex("ORDER_DISH")
                .where({
                    order_id: orderId,
                    dish_id: dishes[0].id
                })
                .del();

            const orderDishes = await knex("ORDER_DISH")
                .select(['DISH.price', 'ORDER_DISH.quantity'])
                .innerJoin("DISH", "DISH.id", "ORDER_DISH.dish_id")
                .where({ order_id: orderId });

            let total = 0;

            for (const dish of orderDishes) {
                total += dish.price * dish.quantity;
            }

            await knex("ORDER")
                .where({ id: orderId })
                .update({
                    amount: total,
                });

            return response.status(200).json({ message: "Prato removido com sucesso." });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ message: "Ocorreu um erro no servidor." });
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

            await knex("ORDER").update({ status, updated_at: knex.fn.now() }).where({ id: orderId })

            return response.json({ message: "Status atualizado com sucesso." })

        } catch (error) {

            throw new AppError(error.message)
        }

    }
}

module.exports = OrderController