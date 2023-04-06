const { Router } = require("express");

const multer = require('multer')
const uploadConfig = require("../configs/upload")
const DishController = require("../Controllers/DishController")
const ensureAuthenticated = require("../middlewares/ensureAuthenticated")

const dishController = new DishController()

const dishRouter = Router()

const upload = multer(uploadConfig.MULTER_DISH)

dishRouter.post("/", ensureAuthenticated(true), upload.single("image"), dishController.create)
dishRouter.get("/:id", ensureAuthenticated(false), dishController.show)
dishRouter.delete("/:id", ensureAuthenticated(true), dishController.delete)
dishRouter.put("/:id", ensureAuthenticated(true), upload.single("image"), dishController.update)

module.exports = dishRouter

