require("express-async-errors")
const database = require("./database/sqlite")
const uploadConfig = require("./configs/upload")
const cors = require('cors')
const AppError = require("./utils/AppError")
const express = require("express")

const routes = require("./routes")

const app = express()
app.use(cors())
app.use("/files", express.static(uploadConfig.UPLOADS_AVATAR));
app.use("/image", express.static(uploadConfig.UPLOADS_DISH_IMAGES));
app.use(express.json())

app.use(routes)

database()

app.use((error, request, response, next) => {
    if (error instanceof AppError) {
        return response.status(error.statuscode).json({
            status: "error",
            message: error.message
        })
    }

    console.error(error)

    return response.status(500).json({
        status: "error",
        message: "Internal server error",
    })
})

const PORT = 4444
app.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
