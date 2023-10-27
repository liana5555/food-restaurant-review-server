const express = require('express')
const { getPosts,
    getPost,
    getPostsForMenu,
   // postPost,
    postPostv2,
    deletePost,
    updatePost,   
    updateAdvertisement,
    postAdvertisement } = require('../controllers/post.js')
const router = express.Router()


router.get("/", getPosts )
router.get("/:id", getPost )
router.post("/", postPostv2)
router.delete("/:id", deletePost)
router.put("/:id", updatePost )
router.get("/menu/:id", getPostsForMenu)


router.post("/advertisements/", postAdvertisement)
router.put("/advertisements/:id", updateAdvertisement)
//router.put("/advertisements/:id/test", updateAdvertisement)




module.exports = router