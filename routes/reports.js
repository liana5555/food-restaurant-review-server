const express = require('express')
const router = express.Router()

const {
    addReport,
    addReportComment
 
} = require('../controllers/reports')

router.post("/", addReport)
router.post("/comments/", addReportComment)






module.exports = router