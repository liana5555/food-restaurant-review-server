const express = require('express')
const { getPosts, getPost, postPost, deletePost, updatePost } = require('../controllers/post.js')
const router = express.Router()


router.get("/", getPosts )
router.get("/:id", getPost )
router.post("/", postPost)
router.delete("/:id", deletePost)
router.put("/:id", updatePost )



module.exports = router