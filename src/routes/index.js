const { Router } = require("express")

const usersRouter = require("./user.routes")
const sessionsRoutes = require("./sessions.routes")
const ingredientsRoutes = require("./ingredient.routes")
const dishRoutes = require("./dish.routes")
const orderRoutes = require("./order.routes")
const routes = Router()

routes.use("/users", usersRouter)
routes.use("/sessions", sessionsRoutes)
routes.use("/ingredients", ingredientsRoutes)
routes.use("/dishes", dishRoutes)
routes.use("/orders", orderRoutes)

module.exports = routes