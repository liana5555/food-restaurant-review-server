const express = require('express')
const router = express.Router()

const {
    postMessage,
    getMessages,
    getAllUsers,
    createConversation,
    listAvavilableConversations
 
} = require('../controllers/chat')



router.post("/", postMessage)

//Add conversation
router.get("/users", getAllUsers) //for choosing the person we want to talk to
router.post("/create_conversation", createConversation)
//!!!!!!!!!!!!!!!!we will have to add pic to the conv later!!!!!!!!!!!!!!


//Listing the conversations on the frontend
router.get("/conversation", listAvavilableConversations)


//Get the messages from a conversation
 //where id is the conversation_id
 //It will have a query like part I will originally
 //fetch data from the date(now) - 2days
router.get("/conversation/:id", getMessages)

module.exports = router