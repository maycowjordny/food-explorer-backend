const { Router } = require("express")

const usersRouter = require("./user.routes")
const sessionsRoutes = require("./sessions.routes")
const dishRoutes = require("./dish.routes")
const orderRoutes = require("./order.routes")
const categoryRoutes = require("./category.routes")
const favoritesRoutes = require("./favorite.routes")
const routes = Router()

routes.use("/users", usersRouter)
routes.use("/sessions", sessionsRoutes)
routes.use("/dishes", dishRoutes)
routes.use("/orders", orderRoutes)
routes.use("/categories", categoryRoutes)
routes.use("/favorites", favoritesRoutes)

module.exports = routes