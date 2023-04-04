const fs = require("fs")
const path = require("path")
const configsUpload = require("../configs/upload")

class DiskStorage {
    async deleteFile(file) {
        const pathAvatar = path.resolve(configsUpload.UPLOADS_AVATAR)
        const pathDish = path.resolve(configsUpload.UPLOADS_DISH_IMAGES)

        if (fs.existsSync(pathAvatar)) {
            await fs.promises.unlink(pathAvatar);
        }

        if (fs.existsSync(pathDish)) {
            await fs.promises.unlink(pathDish);
        }

    }
}

module.exports = DiskStorage