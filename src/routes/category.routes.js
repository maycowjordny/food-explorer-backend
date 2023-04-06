const { Router } = require("express")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const CategoryController = require("../Controllers/CategoryController")

const categoryRoutes = Router()

const categoryController = new CategoryController()

categoryRoutes.get("/", ensureAuthenticated(false), categoryController.index)


module.exports = categoryRoutes