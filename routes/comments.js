const express = require('express')
const router = express.Router()

const { getComments, getReplies, postComments, deleteComments } = require('../controllers/comments')


router.get("/:postid", getComments)
router.get("/:postid/reply/:commentid", getReplies)
router.post("/:postid", postComments)
router.delete("/:commentid", deleteComments )




module.exports = router

