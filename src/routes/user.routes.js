const { Router } = require("express")
const multer = require('multer')
const uploadConfig = require("../configs/upload")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")
const UsersController = require("../Controllers/UsersController")

const userRoutes = Router()

const usersController = new UsersController()

const upload = multer(uploadConfig.MULTER_AVATAR)

userRoutes.post("/", usersController.create)
userRoutes.put("/", ensureAuthenticated(false), upload.single("avatar"), usersController.update)
userRoutes.get("/", ensureAuthenticated(true), usersController.index)


module.exports = userRoutes