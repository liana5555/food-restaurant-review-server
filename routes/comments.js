const express = require('express')
const router = express.Router()

const { getComments, getReplies, postComments, deleteComments } = require('../controllers/comments')
const { jwtVerifyUser } = require('../middlewares')


router.get("/:postid", getComments)
router.get("/:postid/reply/:commentid", getReplies)
router.post("/:postid",jwtVerifyUser, postComments)
router.delete("/:commentid", jwtVerifyUser,  deleteComments )




module.exports = router

