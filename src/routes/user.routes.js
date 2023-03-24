const { Router } = require("express")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const UsersController = require("../Controllers/UsersController")

const userRoutes = Router()

const usersController = new UsersController()

userRoutes.post("/", usersController.create)
userRoutes.put("/:id", ensureAuthenticated(false), usersController.update)


module.exports = userRoutes