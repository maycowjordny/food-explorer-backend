const AppError = require("../utils/AppError")
const { hash, compare } = require("bcryptjs")
const knex = require('../database/knex')
const UserRepository = require("../repositories/user/userRepository")

class UsersController {
    async create(request, response) {

        try {
            const { name, email, password } = request.body
            const avatarImage = request.file.filename

            const hashedPassword = await hash(password, 12)

            const userRepository = new UserRepository()

            const checkEmailExist = await userRepository.findByEmail(email)


            if (checkEmailExist) {
                throw new AppError("E-mail já está sendo utilizado.")
            }

            await userRepository.create({
                name,
                email,
                password: hashedPassword,
                avatar: avatarImage
            })

            return response.status(201).json({ message: 'Usuário criado com sucesso!' })

        } catch (error) {
            throw new AppError(error.message, 500)

        }
    }

    async update(request, response) {

        try {
            const { name, email, password, old_password } = request.body
            const avatarImage = request.file.filename
            const id = request.user.id

            const userRepository = new UserRepository()

            const user = await knex('USERS').where({ id }).first()


            if (!user) {
                throw new AppError("Usuário não encontrado")
            }

            const userWithUpdatedEmail = await userRepository.findByEmail(email)

            if (userWithUpdatedEmail && userWithUpdatedEmail.id !== user.id) {
                throw new AppError("Este e-mail já está em uso.")
            }


            user.name = name ?? user.name
            user.email = email ?? user.email

            if (password && !old_password) {
                throw new AppError("Você precisa informar a senha antiga para definir a nova senha.")
            }

            if (password && old_password) {
                const checkOldPassword = await compare(old_password, user.password)
                if (!checkOldPassword) {
                    throw new AppError("Senha antiga está incorreta.")
                }

                user.password = await hash(password, 12)
            }
            await userRepository
                .update({
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    avatar: avatarImage,
                    password: user.password,
                    updated_at: knex.fn.now()
                })

            return response.status(200).json({ message: 'Usuário atualizado com sucesso!' })

        } catch (error) {

            throw new AppError(error.message, 500)
        }

    }

    async index(request, response) {

        const { startDate, endDate } = request.query;

        const orders = await knex("ORDER").whereBetween("ORDER.created_at", [startDate, endDate])

        await Promise.all(orders.map(async order => {
            const dishes = await knex("ORDER_DISH as OD")
                .select("D.name", "OD.quantity")
                .innerJoin("DISH as D", "D.id", "OD.dish_id")
                .where({ order_id: order.id })

            order.dishes = dishes;

        }))

        return response.status(200).json({ orders });

    }

}

module.exports = UsersController