const knex = require("../database/knex")
const AppError = require("../utils/AppError")
const authConfig = require("../configs/authConfig")
const { compare } = require("bcryptjs")
const { sign } = require("jsonwebtoken")

class SessionsController {
    async create(request, response) {
        const { email, password } = request.body


        const user = await knex('USERS').where({ email }).first()

        if (!user) {
            throw new AppError("E-mail e/ou senha incorreto", 401)
        }

        const passwordMatched = await compare(password, user.password)

        if (!passwordMatched) {
            throw new AppError("E-mail e/ou senha incorreto", 401)
        }

        const { secret } = authConfig.jwt

        const token = sign({ user_id: user.id, is_admin: Boolean(user.is_admin) }, secret)

        return response.json({ user, token })
    }
}

module.exports = SessionsController