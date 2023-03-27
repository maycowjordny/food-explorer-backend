const { Router } = require("express")

const usersRouter = require("./user.routes")
const sessionsRoutes = require("./sessions.routes")
const ingredientsRoutes = require("./ingredient.routes")
const dishRoutes = require("./dish.routes")
const routes = Router()

routes.use("/users", usersRouter)
routes.use("/sessions", sessionsRoutes)
routes.use("/ingredients", ingredientsRoutes)
routes.use("/dish", dishRoutes)

module.exports = routes