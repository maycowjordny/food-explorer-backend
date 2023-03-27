const { Router } = require("express")

const IngredientsController = require("../Controllers/IngredientsController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const ingredientsRoutes = Router()
const ingredientsController = new IngredientsController()


ingredientsRoutes.get("/:id", ensureAuthenticated(false), ingredientsController.index)

module.exports = ingredientsRoutes