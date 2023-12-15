const express = require('express')
const router = express.Router()

const {getRestaurants,
        getRestaurant,
        putReservation,
        getReservations,
        deleteReservation
    } = require('../controllers/restaurants')

const { jwtVerifyUser } = require('../middlewares')

router.get("/", getRestaurants)
router.get("/:id", getRestaurant)

//This  will be the routes for reserving

router.get("/:id/reservation",jwtVerifyUser, getReservations)
router.post("/:id/reservation", jwtVerifyUser, putReservation)
router.delete("/:id/reservation/:reservationid", deleteReservation)





module.exports = router