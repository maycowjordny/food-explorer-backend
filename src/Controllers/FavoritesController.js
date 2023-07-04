const knex = require("../database/knex")
const AppError = require("../utils/AppError")

class FavoritesController {

    async create(request, response) {

        try {
            const userId = request.user.id
            const { dish_id } = request.body

            const favorite = await knex("FAVORITE")
                .where({
                    user_id: userId,
                    dish_id: dish_id
                }).first()

            if (favorite) {
                throw new AppError("Este prato já está nos seus favoritos.")
            }

            await knex("FAVORITE").insert({
                user_id: userId,
                dish_id: dish_id
            })

            return response.json({ message: "Prato adicionado aos favoritos" })

        } catch (error) {
            throw new AppError(error.message)
        }

    }

    async delete(request, response) {

        try {
            const userId = request.user.id
            const dish_id = request.params.id

            const favorite = await knex("FAVORITE")
                .where({
                    user_id: userId,
                    dish_id: dish_id
                }).first()

            if (!favorite) {
                throw new AppError("Este prato não está nos seus favoritos.")
            }

            await knex("FAVORITE").where({
                user_id: userId,
                dish_id: dish_id
            }).delete()

            return response.json({ message: "Prato foi removido dos seus favoritos" })


        } catch (error) {
            throw new AppError(error.message)
        }
    }

    async index(request, response) {

        try {
            const userId = request.user.id

            const favorites = await knex("FAVORITE as FV")
                .innerJoin('DISH as D', 'D.id', 'FV.dish_id')
                .select('D.*', 'D.id')
                .where({ "FV.user_id": userId })

            return response.json(favorites)

        } catch (error) {
            throw new AppError(error.message)
        }
    }
}

module.exports = FavoritesController