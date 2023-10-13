const express = require('express')
const app = express()
const cookieParser = require('cookie-parser')
const cors = require('cors')
const multer = require('multer')
const socket = require("socket.io")

require('dotenv').config()



const authRoutes = require("./routes/auth")
const postRoutes = require("./routes/posts")
const commentsRoutes = require("./routes/comments")
const restaurantRoutes = require("./routes/restaurants")
const userRoutes = require("./routes/users")
const reportsRoutes = require("./routes/reports")
const chatRoutes = require("./routes/chat")

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
app.use("/api/v1/restaurants", restaurantRoutes)
app.use("/api/v1/reports",reportsRoutes )
app.use("/api/v1/chat", chatRoutes)


app.use("/api/v1/users", userRoutes)
app.use(express.urlencoded({extended:false}))


const server = app.listen(port, () => {
    console.log(`Connetcted to port ${port}`)
})


const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST", "PUT"],
        credentials: true
    }
})
/*
io.on("connection", (socket)=> {
    console.log(socket.id)

    socket.on("join_room", (conversation_id)=> {
        socket.join(conversation_id)
        console.log(`User with ID: ${socket.id} joined conversation: ${conversation_id}`)
    })


    socket.on("disconnect", ()=> {
        console.log("User Disconnected", socket.id)
    })


})*/


global.onlineUsers = new Map()
io.on("connection", (socket)=> {
    console.log("User connected")
    global.chatsocket = socket;
    socket.on("addUser", (id)=> {
        onlineUsers.set(id, socket.id)
        
    })

    socket.on("join_room", (conversation_id)=> {
        socket.join(conversation_id)
        console.log(`User with ID: ${socket.id} joined conversation: ${conversation_id}`)
    })

    socket.on("send_message", (messageData) => {
       socket.to(messageData.conversation_id).emit("receive_message",messageData)
    })

    /*
    socket.on("send-msg", (data) => {
        const sendUserSocket = onlineUsers.get(data.conversation_id)
        if (sendUserSocket) {
            socket.to(sendUserSocket).emit("msg-receive", data.message_text)
        }
    })*/

    socket.on("disconnect", ()=> {
        console.log("User Disconnected", socket.id)
    })
})

