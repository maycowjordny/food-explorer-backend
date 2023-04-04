const path = require("path")
const multer = require("multer")
const crypto = require("crypto")

const UPLOADS_AVATAR = path.resolve(__dirname, "uploadsAvatar")
const UPLOADS_DISH_IMAGES = path.resolve(__dirname, "uploadsDish")

const MULTER_AVATAR = {
    storage: multer.diskStorage({
        destination: UPLOADS_AVATAR,
        filename(request, file, callback) {
            const fileHash = crypto.randomBytes(10).toString("hex")
            const fileName = `${fileHash}-${file.originalname}`

            return callback(null, fileName)
        }
    })
}

const MULTER_DISH = {
    storage: multer.diskStorage({
        destination: UPLOADS_DISH_IMAGES,
        filename(request, file, callback) {
            const fileHash = crypto.randomBytes(10).toString("hex")
            const fileName = `${fileHash}-${file.originalname}`

            return callback(null, fileName)
        }
    })
}

module.exports = {
    MULTER_AVATAR,
    MULTER_DISH,
    UPLOADS_AVATAR,
    UPLOADS_DISH_IMAGES,
}