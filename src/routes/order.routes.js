const { Router } = require("express")

const OrderController = require("../Controllers/OrderController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const orderRoutes = Router()
const orderController = new OrderController()

orderRoutes.post("/", ensureAuthenticated(false), orderController.create)
orderRoutes.get("/", ensureAuthenticated(false), orderController.index)
orderRoutes.patch("/:id", ensureAuthenticated(true), orderController.updateStatus)

module.exports = orderRoutes