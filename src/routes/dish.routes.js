const { Router } = require("express");

const DishController = require("../Controllers/DishController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const dishController = new DishController()

const dishRouter = Router()

dishRouter.post("/", ensureAuthenticated(true), dishController.create)

module.exports = dishRouter
