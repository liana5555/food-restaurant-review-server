const db = require("../db");
const jwt = require("jsonwebtoken");

const getRestaurants = async (req, res) => {
  try {
    const q = `SELECT idrestaurants, restaurant_name, city, adress from restaurants
     where restaurant_name like concat('%', ?, '%') or
      city like concat('%', ?, '%') or 
      adress like concat('%', ?, '%') 
      order by restaurant_name asc LIMIT 0, 10`;

    const [restaurants] = await db.query(q, [
      req.query.q,
      req.query.q,
      req.query.q,
    ]);

    return res.status(200).json(restaurants);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const getRestaurant = async (req, res) => {
  try {
    const q = "SELECT * FROM restaurants where idrestaurants= ?";

    const [restaurant] = await db.query(q, [req.params.id]);
    return res.status(200).json(restaurant);
  } catch (err) {
    console.log(err);
    return res.status(500).json("internal server error");
  }
};

const getReservations = async (req, res) => {
  try {
    const q = "select * from reservation where user_id=? and restaurant_id=?";

    const values = [
      req.userInfo.id,
      req.params.id, //it is the restaurant id
    ];

    const [reservations] = await db.query(q, [req.userInfo.id, req.params.id]);

    return res.status(200).json(reservations);
  } catch (err) {
    console.log(err);
    return res.status(500).json("internal server error");
  }
};

const putReservation = async (req, res) => {
  try {
    const q =
      "INSERT INTO reservation(`starting_date`, `ending_date`, `number_of_people`, `reserver_name`, `user_id`, `restaurant_id`) VALUES(?,?,?,?,?,?);";

    const values = [
      req.body.starting_date,
      req.body.ending_date,
      req.body.number_of_people,
      req.body.reserver_name,
    ];

    const [resultOfReservations] = await db.query(q, [
      ...values,
      req.userInfo.id,
      req.params.id,
    ]);

    return res
      .status(200)
      .json(
        "The reservation has been created and it is pending till it's not accepted by the restaurant."
      );
  } catch (err) {
    console.log(err);
    return res.status(500).json("internal server error");
  }

  //  })
};

const deleteReservation = (req, res) => {
  console.log("Delete reservation");
};

module.exports = {
  getRestaurants,
  getRestaurant,
  getReservations,
  putReservation,
  deleteReservation,
};
