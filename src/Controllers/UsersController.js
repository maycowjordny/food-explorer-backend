const AppError = require("../utils/AppError")
const { hash, compare } = require("bcryptjs")
const knex = require('../database/knex')

class UsersController {
    async create(request, response) {
        const { name, email, password } = request.body

        const hashedPassword = await hash(password, 12)

        const checkEmailExist = await knex('USERS').where({ email }).first()
        if (checkEmailExist) {
            throw new AppError("E-mail já está sendo utilizado.")
        }

        await knex('USERS').insert({
            name,
            email,
            password: hashedPassword,
        })

        return response.status(201).json({ message: 'Usuário criado com sucesso!' })
    }

    async update(request, response) {
        const { name, email, password, old_password } = request.body
        const userId = request.user.id
        try {

            const checkUserExist = await knex('USERS').where({ id: userId })

            if (!checkUserExist) {
                throw new AppError("Usuário não encontrado")
            }

            const userWithUpdatedEmail = await knex('USERS').where({ email })

            if (userWithUpdatedEmail && userWithUpdatedEmail.id !== checkUserExist.id) {
                throw new AppError("Este e-mail já está em uso.")
            }




        } catch (error) {
            console.log(error)

            return response.status(500).json({ error: "Erro ao atualizar o usuário" })
        }










    }




}

module.exports = UsersController