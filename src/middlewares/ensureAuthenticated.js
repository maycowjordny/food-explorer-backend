const { verify } = require("jsonwebtoken")
const AppError = require("../utils/AppError")
const authConfig = require("../configs/authConfig")

function ensureAuthenticated(shouldIsAdmin) {
    return function (request, response, next) {
        const authHead = request.headers.authorization

        if (!authHead) {
            throw new AppError("JWT token não informado", 401)
        }

        const [, token] = authHead.split(" ")

        try {
            const { is_admin, user_id } = verify(token, authConfig.jwt.secret)

            if (shouldIsAdmin && !Boolean(is_admin)) {
                return response.status(403).json({ message: "Você não pode acessar esse recurso." })
            }

            request.user = {
                id: Number(user_id)
            }

            return next()

        } catch {
            throw new AppError("JWT token inválido", 401)
        }
    }

}
module.exports = ensureAuthenticated;