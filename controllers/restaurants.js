const db = require('../db')
const jwt = require('jsonwebtoken')





const getRestaurants = (req, res) => {
    const q = `SELECT idrestaurants, restaurant_name, city, adress from restaurants
     where restaurant_name like concat('%', ?, '%') or
      city like concat('%', ?, '%') or 
      adress like concat('%', ?, '%') 
      order by restaurant_name asc LIMIT 0, 10`   

    db.query(q,[req.query.q, req.query.q, req.query.q],(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })
}

const getRestaurant = (req, res) => {
    const q = "SELECT * FROM restaurants where idrestaurants= ?"

    db.query(q, [req.params.id], (err, data) => {
        if (err) return res.status(500).send(err)

        return res.status(200).json(data)
    })
}



const getReservations = (req, res) => {
   /* const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")
    */
    const q = "select * from reservation where user_id=? and restaurant_id=?"

    const values = [
        req.userInfo.id,
        req.params.id //it is the restaurant id
    ]
 

    db.query(q, [req.userInfo.id, req.params.id], (err, data) => {
        if(err) return res.status(500).json(err)
        return res.status(200).json(data)
   
    })

  //  })
}


const putReservation = (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

*/
        const q = "INSERT INTO reservation(`starting_date`, `ending_date`, `number_of_people`, `reserver_name`, `user_id`, `restaurant_id`) VALUES(?,?,?,?,?,?);"

        const values = [
                        req.body.starting_date,
                        req.body.ending_date,
                        req.body.number_of_people,
                        req.body.reserver_name,
                         //this is the restaurant id
                        ]
        
        db.query(q, [...values, req.userInfo.id, req.params.id] , (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json("The reservation has been created and it is pending till it's not accepted by the restaurant.")
        })


  //  })
}


const deleteReservation = (req, res) => {
    console.log("Delete reservation")
}


module.exports = {
    getRestaurants,
    getRestaurant,
    getReservations,
    putReservation,
    deleteReservation
}