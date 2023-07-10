const { Router } = require("express")
const multer = require('multer')
const uploadConfig = require("../configs/upload")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const UsersController = require("../Controllers/UsersController")
const UserAvatar = require("../Controllers/UserAvatar")

const userRoutes = Router()
const upload = multer(uploadConfig.MULTER_AVATAR)

const usersController = new UsersController()
const userAvatar = new UserAvatar()

userRoutes.post("/", usersController.create)
userRoutes.put("/", ensureAuthenticated(false), upload.single("avatar"), usersController.update)
userRoutes.get("/", ensureAuthenticated(true), usersController.index)
userRoutes.patch("/avatar", ensureAuthenticated(false), upload.single("avatar"), userAvatar.update);

module.exports = userRoutes