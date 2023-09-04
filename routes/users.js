const express = require('express')
const router = express.Router()


const {getUserData,
     getAllUserReservation,
      deleteUserReservations,
       deleteUser,
       getAllUsers,
       updateManagedUser,
       deleteManagedUser
  
} = require('../controllers/users')


router.get("/", getUserData)
router.get("/reservations", getAllUserReservation)
router.delete("/reservations/:id", deleteUserReservations)
router.delete("/", deleteUser)
//router.put("/", updateProfile)


router.get("/admin/managed_user", getAllUsers)
router.put("/admin/managed_user/:id", updateManagedUser)
router.delete("/admin/managed_user/:id", deleteManagedUser)


//router.get("/admin/managed_reports", getAllReports)
//


module.exports = router