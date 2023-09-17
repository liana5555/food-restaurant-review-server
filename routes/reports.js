const express = require('express')
const router = express.Router()

const {
    addReport
 
} = require('../controllers/reports')

router.post("/", addReport)






module.exports = router