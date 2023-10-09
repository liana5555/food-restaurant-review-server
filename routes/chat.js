const express = require('express')
const router = express.Router()

const {
    postMessage,
    getMessages,
    getAllUsers,
    createConversation
 
} = require('../controllers/chat')

router.get("/from=:fromid", getMessages)

router.post("/", postMessage)

router.get("/users", getAllUsers)

router.post("/create_conversation", createConversation)


module.exports = router