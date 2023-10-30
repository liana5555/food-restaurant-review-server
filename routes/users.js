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
       updateReservationStatus,
       updateReservationStatusByUser,
       updateProfile,
       updateRestaurant,
       updatePsw
  
} = require('../controllers/users')

/* 


     NORMAL USERS / EVERYONE


*/
router.get("/", getUserData)
router.get("/reservations", getAllUserReservation)
//router.delete("/reservations/:id", deleteUserReservations) //I got rid of this function on the frontend
router.put("/reservations/:id", updateReservationStatusByUser) //cancelling reservation. They can only cancel with this
router.delete("/", deleteUser)
router.put("/", updateProfile)
router.put("/psw/", updatePsw)

/* 


    ADMIN


*/
router.get("/admin/managed_user", getAllUsers)
router.put("/admin/managed_user/:id", updateManagedUser)
router.delete("/admin/managed_user/:id", deleteManagedUser)


router.get("/admin/managed_reports", getAllReports)
router.get("/admin/managed_reports/:id", getAllReportsForPost)
router.delete("/admin/managed_reports/:post_id", deleteReportsByPost)



/* 


     RESTAURANT WORKERS


*/
router.get("/restaurant/:restaurant_id/reservations", getAllReservationsByRestaurant)
router.put("/restaurant_worker/restaurant/:restaurant_id/managed_reservation/:id", updateReservationStatus )
router.put("/restaurant/:restaurant_id", updateRestaurant)


module.exports = router