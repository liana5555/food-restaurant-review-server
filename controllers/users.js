const db = require('../db')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')



/* 


     NORMAL USERS / EVERYONE


*/

const getUserData = (req, res) => {

    //console.log(req.userInfo.id)
    /*const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")
*/

        const q = "select username, first_name, last_name, email, img from users where idusers=?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json(data)
        })

   // })
}

// Dokumentécióban benne
const getAllUserReservation = (req, res) => {
        const q = `select idreservation,
                            starting_date,
                            ending_date,
                            number_of_people,
                            reserver_name,
                            restaurant_id,
                            status,
                            restaurant_name from reservation 
                join restaurants on reservation.restaurant_id = restaurants.idrestaurants
                where user_id = ? order by starting_date desc`



    db.query(q, [req.userInfo.id], (err, data) => {
        if(err) return res.status(500).json(err)
        return res.status(200).json(data)
   
    })
}

//Nem használod helyette van a kövi
const deleteUserReservations = (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const reservationId = req.params.id

        const q = "DELETE FROM reservation WHERE `idreservation`= ? AND `user_id` = ?"

        db.query(q, [reservationId, req.userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your reservations.")

            return res.json("Reservation has been deleted")

        })
  //  })
}

const updateReservationStatusByUser = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/
        if(req.body.status === "accepted") return res.status(500).json("Only restaurant workers can accept reservations. ")

        const q = "update reservation set status = ?  where idreservation = ? and user_id=? "

        db.query(q, [req.body.status, req.params.id, req.userInfo.id], (err, data) => {
            if(err) return res.status(500).send(err)

            return res.status(200).json("The reservation's status has been updated")

        })
  //  })
}

const deleteUser= (req, res) => {
   /* const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        

        const q = "DELETE FROM users where `idusers` = ?;"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your profile.")

            return res.json("Your profile has been deleted.")

        })
  //  })
}

const updateProfile = (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/
        const values = [
                req.body.username,
                req.body.first_name,
                req.body.last_name,
                req.body.email,
                req.body.img,
            ]
        const q = `UPDATE users set username=?, first_name=?, last_name=?, email=?, img = ?  where idusers = ?`

        db.query(q, [...values,  req.userInfo.id], (err, data) => {
            if (err) return res.status(500).send(err)
            return res.status(200).json("You successfully updated your profile infromation. Please log out and login again to make sure evrything works fine")
        })

  //  })
}

const updatePsw = (req, res) => {
    /*const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "select password from users where idusers = ?"

        db.query(q, [req.userInfo.id], (err, data)=> {
            if (err) return res.status(500).json(err)
            if (data.length === 0 ) return res.status(404).josn("User is not found")

            const isPasswordCorrect = bcrypt.compareSync(req.body.oldpassword, data[0].password)
            if (!isPasswordCorrect) return res.status(400).json("Wrong old password")

            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.password, salt)

            const query = "update users set password = ? where idusers = ? "
            db.query(query, [hash, req.userInfo.id], (err, data)=> {
                if (err) return res.status(500).json(err)

                return res.status(200).json("Password has been changed. Please logout and login to make sure everything works fine.")


            })


        })



//    })


}

/* 


    ADMIN


*/


const getAllUsers = (req, res) => {

        //we need to make sure if the person with userInfo.id is an admin
        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can get others information")

        
        //It might need some limit since if I have a lot of users I shouldn't show all of them at once.
        //const q = "SELECT idusers, username, email, first_name, last_name, type from users where idusers != ?"

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
    where idusers != ?`

            db.query(q, [req.userInfo.id], (err, data) => {
                if(err) return res.status(500).json(err)

                return res.status(200).json(data)

            })
        })


}


const updateManagedUser = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        //we need to make sure if the person with userInfo.id is an admin
        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can change others profile")

            const values = [
                req.body.username,
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.type,
               

            ]

            if (req.body.type !== "restaurant worker") {
                 const q = "UPDATE users set username=?, first_name=?, last_name=?, email=?, type = ?, restaurant_id = null  where idusers = ?"

                db.query(q, [...values,req.params.id], (err, data) => {
                    if (err) return res.status(500).json(err)
                        
                    return res.status(200).json("User has been updated")
            })

            }
            else {
                try {
                    updateManagedUserRestaurantWorker(req, res)
                }
                catch(err) {
                    return res.status(500).send(err)
                }

                

            }

     


        })




  //  })
}
async function updateManagedUserRestaurantWorker (req, res) {
    const mysql = require('mysql2/promise');

    // get the promise implementation, we will use bluebird
    const bluebird = require('bluebird');

// create the connection, specify bluebird as Promise
    const connection = await mysql.createConnection({host:process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_DATABASE, password:process.env.DB_PASSWORD , Promise: bluebird});
    
    const q = "select * from  restaurants where restaurant_name = ? and city=? "
       

        const [rows, fields] = await connection.execute(q, [req.body.restaurant_name, req.body.city])

        let restaurant_id
        if (rows.length === 0) {
            const q2 ="Insert into restaurants(`restaurant_name`, `city`, `adress`) VALUES(?,?,?)"

            const [rows2, fields2] = await connection.execute(q2, [req.body.restaurant_name, req.body.city, req.body.adress])
            //Insert
            restaurant_id= rows2.insertId
        }
        else {

            restaurant_id = rows[0].idrestaurants

        }

        const q_update = "UPDATE users set username=?, first_name=?, last_name=?, email=?, type = ?, restaurant_id = ?  where idusers = ?"

        const values = [
            req.body.username,
            req.body.firstName,
            req.body.lastName,
            req.body.email,
            req.body.type,
            restaurant_id
           

        ]

        db.query (q_update, [...values, req.params.id], (err, data)=> {
            if(err) return res.status(500).send(err)
            return res.status(200).json("The user has been succesfully updated.")

        })

}


const deleteManagedUser= (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        //we need to make sure if the person with userInfo.id is an admin
        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can change others profile")

            const q = "DELETE FROM users where `idusers` = ?;"

            db.query(q, [req.params.id], (err, data) => {
            if(err) return res.status(500).json(err)

            return res.json("The profile has been deleted.")

        })
    })
//})
}



const getAllReports = (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can list reported posts")

            const q = `select  count(idreports) as sumreports , post_id, p.title  from reports
            join posts p on p.idposts = reports.post_id
             group by post_id`

             db.query(q, (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)
             })

        })




  //  })

}

const getAllReportsForPost = (req, res) => {
  /*  const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can list reported posts")

            const q = `select * from reports where post_id = ?`

             db.query(q, [req.params.id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)
             })

        })




   // })

}

const deleteReportsByPost = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [req.userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can delete reports.")
        
        
            const q = "delete from reports where post_id = ?"

            db.query(q, [req.params.post_id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json("The reports to this post has been deleted.")

            })
        
        
        })
   // })

}

/* 


     RESTAURANT WORKERS


*/

const getAllReservationsByRestaurant = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?"

        db.query(q, [req.userInfo.id,req.params.restaurant_id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only the restaurant's worker can get the data.")
        
        
            const q = `select idreservation,
                             starting_date,
                              ending_date,
                               number_of_people,
                                reserver_name,
                                 restaurant_id,
                                  status,
                                   restaurant_name from reservation 
                    join restaurants on reservation.restaurant_id = restaurants.idrestaurants
                    where restaurant_id = ? order by starting_date desc`

            db.query(q, [req.params.restaurant_id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        
        
        })
   // })

}

const updateReservationStatus = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?"

        db.query(q, [req.userInfo.id,req.params.restaurant_id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only the restaurant's worker can modify the data.")
        
        
            const q = "update reservation set status = ?  where idreservation = ? "

            db.query(q, [req.body.status, req.params.id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json("The reservation's status has been updated")

            })
        
        
        })
 //   })

}


const updateRestaurant = (req, res) => {
/*
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")*/

        const q = "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?"

        db.query(q, [req.userInfo.id,req.params.restaurant_id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only the restaurant's worker can modify the data.")
        
        
            const q = "update restaurants set restaurant_name = ?, city=?, adress=?, description=?, opening_time=?, closing_time=?  where idrestaurants = ? "

            const values = [
                req.body.restaurant_name,
                req.body.city,
                req.body.adress,
                req.body.description, 
                req.body.opening_time,
                req.body.closing_time,
                
            ]

            db.query(q, [...values, req.params.restaurant_id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json("The restaurant's details have been updated")

            })
        
        
        })
   // })


}












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
    updatePsw
   
}

