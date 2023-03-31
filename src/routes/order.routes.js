const { Router } = require("express")

const OrderController = require("../Controllers/OrderController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const orderRoutes = Router()
const orderController = new OrderController()

orderRoutes.post("/", ensureAuthenticated(false), orderController.create)

module.exports = orderRoutes