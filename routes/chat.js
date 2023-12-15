const express = require('express')
const router = express.Router()

const {
    postMessage,
    getMessages,
    getAllUsers,
    createConversation,
    listAvavilableConversations
 
} = require('../controllers/chat')

const { jwtVerifyUser } = require('../middlewares')



router.post("/",jwtVerifyUser, postMessage)

//Add conversation
router.get("/users",jwtVerifyUser, getAllUsers) //for choosing the person we want to talk to
router.post("/create_conversation", jwtVerifyUser, createConversation)
//!!!!!!!!!!!!!!!!we will have to add pic to the conv later!!!!!!!!!!!!!!


//Listing the conversations on the frontend
router.get("/conversation",jwtVerifyUser, listAvavilableConversations)


//Get the messages from a conversation
 //where id is the conversation_id
 //It will have a query like part I will originally
 //fetch data from the date(now) - 2days
router.get("/conversation/:id",jwtVerifyUser, getMessages)

module.exports = router