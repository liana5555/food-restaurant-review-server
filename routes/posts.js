const express = require('express')
const { getPosts,
    getPost,
    getPostsForMenu,
   // postPost,
    postPostv2,
    deletePost,
    updatePost,   
    updateAdvertisement,
    deleteAdvertisement,
    postAdvertisement } = require('../controllers/post.js')
const router = express.Router()

const { jwtVerifyUser } = require('../middlewares')


router.get("/", getPosts )
router.get("/:id", getPost )
router.post("/", jwtVerifyUser, postPostv2)
router.delete("/:id", jwtVerifyUser, deletePost)
router.put("/:id", jwtVerifyUser, updatePost )  //you need to rewrite this
router.get("/menu/:id", getPostsForMenu)


router.post("/advertisements/", jwtVerifyUser,postAdvertisement)
router.put("/advertisements/:id", jwtVerifyUser,updateAdvertisement)
//router.put("/advertisements/:id/test", updateAdvertisement)
router.delete("/advertisements/:id", jwtVerifyUser,deleteAdvertisement)



module.exports = router