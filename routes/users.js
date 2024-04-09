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
const { jwtVerifyUser } = require('../middlewares')

/* 


     NORMAL USERS / EVERYONE


*/
router.get("/",jwtVerifyUser, getUserData)
router.get("/reservations", jwtVerifyUser, getAllUserReservation)
//router.delete("/reservations/:id", deleteUserReservations) //I got rid of this function on the frontend
router.put("/reservations/:id", jwtVerifyUser, updateReservationStatusByUser) //cancelling reservation. They can only cancel with this
router.delete("/", jwtVerifyUser,deleteUser)
router.put("/", jwtVerifyUser,updateProfile)
router.put("/psw/", jwtVerifyUser,updatePsw)

/* 


    ADMIN


*/
router.get("/admin/managed_user",jwtVerifyUser, getAllUsers)
router.put("/admin/managed_user/:id", jwtVerifyUser,updateManagedUser)
router.delete("/admin/managed_user/:id", jwtVerifyUser, deleteManagedUser)


router.get("/admin/managed_reports",jwtVerifyUser,  getAllReports)
router.get("/admin/managed_reports/:id",jwtVerifyUser, getAllReportsForPost)
router.delete("/admin/managed_reports/:post_id", jwtVerifyUser, deleteReportsByPost)



/* 


     RESTAURANT WORKERS


*/
router.get("/restaurant/:restaurant_id/reservations", jwtVerifyUser,getAllReservationsByRestaurant)
router.put("/restaurant_worker/restaurant/:restaurant_id/managed_reservation/:id", jwtVerifyUser,updateReservationStatus )
router.put("/restaurant/:restaurant_id",jwtVerifyUser, updateRestaurant)


module.exports = router