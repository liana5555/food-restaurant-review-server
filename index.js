const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const multer = require('multer')

require('dotenv').config()



const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/posts")
const commentsRoutes = require("./routes/comments")

const port = 5000

app.use(express.json())
app.use(cookieParser())
app.use(cors())

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, '../client/public/uploads')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})


const upload = multer({ storage })

app.post('/api/v1/uploads', upload.single('file'), function (req, res) {
    const file =  req.file
    //console.log(file)
    res.status(200).json(file.filename)
})

app.get("/", (req, res) => { 
    console.log("I am here")
    res.send("<h2>It's Working!</h2>"); 
}); 

app.use("/api/v1/posts", postRoutes)
app.use("/api/v1/auth" , authRoutes)
app.use("/api/v1/comments",commentsRoutes)
//app.use("/api/v1/users", userRoutes)
app.use(express.urlencoded({extended:false}))


app.listen(port, () => {
    console.log(`Connetcted to port ${port}`)
})