const express = require('express')
const router = express.Router()

const {getRestaurants,
        getRestaurant,
        putReservation,
        getReservations,
        deleteReservation
    } = require('../controllers/restaurants')



router.get("/", getRestaurants)
router.get("/:id", getRestaurant)

//This  will be the routes for reserving

router.get("/:id/reservation", getReservations)
router.post("/:id/reservation", putReservation)
router.delete("/:id/reservation/:reservationid", deleteReservation)





module.exports = router