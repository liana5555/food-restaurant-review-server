const express = require('express')
const router = express.Router()
const {
    Register, Login, getReg, Logout
} = require('../controllers/auth')

router.get("/register", getReg)
router.post("/register", Register)
router.post("/login", Login)
router.post("/logout", Logout)


module.exports = router