const { Router } = require("express")

const usersRouter = require("./user.routes")
const sessionsRoutes = require("./sessions.routes")
const routes = Router()

routes.use("/users", usersRouter)
routes.use("/sessions", sessionsRoutes)

module.exports = routes