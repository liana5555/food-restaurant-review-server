const express = require('express')
const router = express.Router()


const {getUserData, getAllUserReservation, deleteUserReservations, deleteUser
  
} = require('../controllers/users')


router.get("/", getUserData)
router.get("/reservations", getAllUserReservation)
router.delete("/reservations/:id", deleteUserReservations)
router.delete("/", deleteUser)


module.exports = router