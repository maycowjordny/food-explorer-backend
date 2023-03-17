const { Router } = require("express")

const UsersController = require("../Controllers/UsersController")

const userRoutes = Router()

const usersController = new UsersController()

userRoutes.post("/", usersController.create)


module.exports = userRoutes