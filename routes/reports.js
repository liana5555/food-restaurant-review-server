const express = require('express')
const router = express.Router()

const {
    addReport,
    addReportComment
 
} = require('../controllers/reports')

const { jwtVerifyUser } = require('../middlewares')

router.post("/",jwtVerifyUser, addReport)
router.post("/comments/",jwtVerifyUser, addReportComment)






module.exports = router