const express = require('express')
const router = express.Router()


const {getUserData,
     getAllUserReservation,
      deleteUserReservations,
       deleteUser,
       getAllUsers,
       updateManagedUser,
       deleteManagedUser,
       getAllReports,
       getAllReportsForPost,
       deleteReportsByPost,
       getAllReservationsByRestaurant,
       updateReservationStatus
  
} = require('../controllers/users')


router.get("/", getUserData)
router.get("/reservations", getAllUserReservation)
router.delete("/reservations/:id", deleteUserReservations)
router.delete("/", deleteUser)
//router.put("/", updateProfile)


router.get("/admin/managed_user", getAllUsers)
router.put("/admin/managed_user/:id", updateManagedUser)
router.delete("/admin/managed_user/:id", deleteManagedUser)


router.get("/admin/managed_reports", getAllReports)
router.get("/admin/managed_reports/:id", getAllReportsForPost)
router.delete("/admin/managed_reports/:post_id", deleteReportsByPost)


//restaurant worker
router.get("/restaurant/:restaurant_id/reservations", getAllReservationsByRestaurant)
router.put("/restaurant_worker/restaurant/:restaurant_id/managed_reservation/:id", updateReservationStatus )


module.exports = router