const { Router } = require("express")

const FavoritesController = require("../Controllers/FavoritesController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const favoritesController = new FavoritesController()

const favoritesRouter = Router()

favoritesRouter.post("/", ensureAuthenticated(false), favoritesController.create)
favoritesRouter.delete("/:id", ensureAuthenticated(false), favoritesController.delete)
favoritesRouter.get("/", ensureAuthenticated(false), favoritesController.index)


module.exports = favoritesRouter