const { Router } = require("express")

const SessionsController = require("../Controllers/SessionsController")

const sessionController = new SessionsController()

const sessionsRoutes = Router()

sessionsRoutes.post("/", sessionController.create)

module.exports = sessionsRoutes
