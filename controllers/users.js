const db = require("../db");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

/* 


     NORMAL USERS / EVERYONE


*/

const getUserData = async (req, res) => {
  try {
    const q =
      "select username, first_name, last_name, email, img from users where idusers=?";

    const [userData] = await db.query(q, [req.userInfo.id]);

    return res.status(200).json(userData);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const getAllUserReservation = async (req, res) => {
  try {
    const q = `select idreservation,
                            starting_date,
                            ending_date,
                            number_of_people,
                            reserver_name,
                            restaurant_id,
                            status,
                            restaurant_name from reservation 
                join restaurants on reservation.restaurant_id = restaurants.idrestaurants
                where user_id = ? order by starting_date desc`;

    const [reservations] = await db.query(q, [req.userInfo.id]);
    return res.status(200).json(reservations);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

//Nem használod helyette van a kövi
const deleteUserReservations = async (req, res) => {
  try {
    const reservationId = req.params.id;

    const q =
      "DELETE FROM reservation WHERE `idreservation`= ? AND `user_id` = ?";

    const [result] = await db.query(q, [reservationId, req.userInfo.id]);

    if (result.affectedRows) {
      return res.json("Reservation has been deleted");
    } else {
      return res.status(403).json("You can only delete your own reservations.");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updateReservationStatusByUser = async (req, res) => {
  if (req.body.status === "accepted")
    return res
      .status(403)
      .json("Only restaurant workers can accept reservations. ");

  try {
    const q =
      "update reservation set status = ?  where idreservation = ? and user_id=? ";

    const [updateReservation] = await db.query(q, [
      req.body.status,
      req.params.id,
      req.userInfo.id,
    ]);

    return res.status(200).json("The reservation's status has been updated");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const deleteUser = async (req, res) => {
  try {
    const q = "DELETE FROM users where `idusers` = ?;";

    const [result] = await db.query(q, [req.userInfo.id]);

    if (result.affectedRows === 0)
      return res.status(403).json("You can only delete your own profile.");

    return res.status(200).json("Your profile has been deleted.");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updateProfile = async (req, res) => {
  try {
    const values = [
      req.body.username,
      req.body.first_name,
      req.body.last_name,
      req.body.email,
      req.body.img,
    ];
    const q = `UPDATE users set username=?, first_name=?, last_name=?, email=?, img = ?  where idusers = ?`;

    const [updatedUser] = await db.query(q, [...values, req.userInfo.id]);
    return res
      .status(200)
      .json(
        "You successfully updated your profile infromation. Please log out and login again to make sure evrything works fine."
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updatePsw = async (req, res) => {
  try {
    const q = "select password from users where idusers = ?";

    const [foundUserData] = await db.query(q, [req.userInfo.id]);
    if (foundUserData.length === 0)
      return res.status(404).josn("User is not found");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.oldpassword,
      foundUserData[0].password
    );
    if (!isPasswordCorrect) return res.status(400).json("Wrong old password");

    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password, salt);

    const query = "update users set password = ? where idusers = ? ";
    const [settingNewPassword] = await db.query(query, [hash, req.userInfo.id]);

    return res
      .status(200)
      .json(
        "Password has been changed. Please logout and login to make sure everything works fine."
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

/* 


    ADMIN


*/

const isAdmin = async (req, res) => {
  const q = "SELECT * from users where type='admin' and idusers = ?";

  const [result] = await db.query(q, [req.userInfo.id]);
  if (result.length === 0)
    //throw new Error("Not admin");
    return [];

  return result;
};

const getAllUsers = async (req, res) => {
  //we need to make sure if the person with userInfo.id is an admin
  try {
    const isAdminResult = await isAdmin(req, res);

    const q = `SELECT idusers,
            username,
            email,
            first_name, 
            last_name,
            type, 
            r.idrestaurants, 
            r.restaurant_name, 
            r.city, 
            r.adress from users
    left join restaurants r on r.idrestaurants = users.restaurant_id
    where idusers != ?`;
    if (isAdminResult.length > 0) {
      const [allUsers] = await db.query(q, [req.userInfo.id]);
      return res.status(200).json(allUsers);
    } else {
      return res.status(403).json("Only admin has access.");
    }
  } catch (err) {
    console.log("This is what I log: ", err);
    return res.status(500).json("Internal server error");
  }

  //It might need some limit since if I have a lot of users I shouldn't show all of them at once.
};

const updateManagedUser = async (req, res) => {
  try {
    const isAdminResult = await isAdmin(req, res);

    if (isAdminResult.length === 0) {
      return res.status(403).json("Only admin has access.");
    }

    const values = [
      req.body.username,
      req.body.firstName,
      req.body.lastName,
      req.body.email,
      req.body.type,
    ];

    if (req.body.type !== "restaurant worker") {
      const q =
        "UPDATE users set username=?, first_name=?, last_name=?, email=?, type = ?, restaurant_id = null  where idusers = ?";

      const [updateUser] = await db.query(q, [...values, req.params.id]);

      return res.status(200).json("User has been updated");
    } else {
      await updateManagedUserRestaurantWorker(req, res);
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};
async function updateManagedUserRestaurantWorker(req, res) {
  const q = "select * from  restaurants where restaurant_name = ? and city=? ";

  const [rows, fields] = await db.execute(q, [
    req.body.restaurant_name,
    req.body.city,
  ]);

  let restaurant_id;
  if (rows.length === 0) {
    const q2 =
      "Insert into restaurants(`restaurant_name`, `city`, `adress`) VALUES(?,?,?)";

    const [rows2, fields2] = await db.execute(q2, [
      req.body.restaurant_name,
      req.body.city,
      req.body.adress,
    ]);
    //Insert
    restaurant_id = rows2.insertId;
  } else {
    restaurant_id = rows[0].idrestaurants;
  }

  const q_update =
    "UPDATE users set username=?, first_name=?, last_name=?, email=?, type = ?, restaurant_id = ?  where idusers = ?";

  const values = [
    req.body.username,
    req.body.firstName,
    req.body.lastName,
    req.body.email,
    req.body.type,
    restaurant_id,
  ];

  const [result] = await db.query(q_update, [...values, req.params.id]);
  return res.status(200).json("The user has been succesfully updated.");
}

const deleteManagedUser = async (req, res) => {
  try {
    const isAdminResult = await isAdmin(req, res);

    if (isAdminResult.length === 0) {
      return res.status(403).json("Only admin has access.");
    }

    const q = "DELETE FROM users where `idusers` = ?;";

    cosnt[result] = await db.query(q, [req.params.id]);
    return res.status(200).json("The profile has been deleted.");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const getAllReports = async (req, res) => {
  try {
    const isAdminResult = await isAdmin(req, res);

    if (isAdminResult.length === 0) {
      return res.status(403).json("Only admin has access.");
    }

    const queryReports = `select  count(idreports) as sumreports , post_id, p.title  from reports
            join posts p on p.idposts = reports.post_id
             group by post_id`;

    const [reports] = await db.query(queryReports);

    return res.status(200).json(reports);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const getAllReportsForPost = async (req, res) => {
  try {
    const isAdminResult = await isAdmin(req, res);

    if (isAdminResult.length === 0) {
      return res.status(403).json("Only admin has access.");
    }

    const queryReports = `select * from reports where post_id = ?`;

    const [reports] = await db.query(queryReports, [req.params.id]);

    return res.status(200).json(reports);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const deleteReportsByPost = async (req, res) => {
  try {
    const isAdminResult = await isAdmin(req, res);

    if (isAdminResult.length === 0) {
      return res.status(403).json("Only admin has access.");
    }

    const q = "delete from reports where post_id = ?";

    const [result] = await db.query(q, [req.params.post_id]);

    return res.status(200).json("The reports to this post has been deleted.");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

/* 


     RESTAURANT WORKERS


*/
const isRestaurantWorker = async (req, res) => {
  const q =
    "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?";

  const [result] = await db.query(q, [
    req.userInfo.id,
    req.params.restaurant_id,
  ]);
  if (result.length === 0) return [];

  return result;
};

const getAllReservationsByRestaurant = async (req, res) => {
  try {
    const restaurantWorker = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    const q = `select idreservation,
                             starting_date,
                              ending_date,
                               number_of_people,
                                reserver_name,
                                 restaurant_id,
                                  status,
                                   restaurant_name from reservation 
                    join restaurants on reservation.restaurant_id = restaurants.idrestaurants
                    where restaurant_id = ? order by starting_date desc`;

    const [reservations] = await db.query(q, [req.params.restaurant_id]);

    return res.status(200).json(reservations);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updateReservationStatus = async (req, res) => {
  try {
    const restaurantWorker = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    const q = "update reservation set status = ?  where idreservation = ? ";

    const [updateResult] = await db.query(q, [req.body.status, req.params.id]);

    return res.status(200).json("The reservation's status has been updated");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updateRestaurant = async (req, res) => {
  try {
    const restaurantWorker = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    const q =
      "update restaurants set restaurant_name = ?, city=?, adress=?, description=?, opening_time=?, closing_time=?  where idrestaurants = ? ";

    const values = [
      req.body.restaurant_name,
      req.body.city,
      req.body.adress,
      req.body.description,
      req.body.opening_time,
      req.body.closing_time,
    ];

    const [updateResult] = await db.query(q, [
      ...values,
      req.params.restaurant_id,
    ]);
    return res.status(200).json("The restaurant's details have been updated");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  getUserData,
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
  updatePsw,
};
