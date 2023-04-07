const knex = require("../../database/knex")

class UserRepository {
    async findByEmail(email) {

        const userEmail = await knex('USERS').where({ email }).first()

        return userEmail
    }

    async create({ name, email, password: hashedPassword }) {

        const createUser = await knex('USERS').insert({
            name,
            email,
            password: hashedPassword
        })

        return { id: createUser }

    }

    async update({ id, name, email, password, avatar, updated_at }) {
        const updateUserId = await knex('USERS')
            .where({ id })
            .update({
                id,
                name,
                email,
                avatar,
                password,
                updated_at
            })


        return { id: updateUserId }

    }
}

module.exports = UserRepository