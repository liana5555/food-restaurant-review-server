const db = require('../db')
const jwt = require('jsonwebtoken')



const getUserData = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")


        const q = "select username, first_name, last_name, email, img from users where idusers=?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            return res.status(200).json(data)
        })

    })
}


const getAllUserReservation = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

    const q = "select * from reservation where user_id=?"

    const values = [
        userInfo.id,
        
    ]
 

    db.query(q, [userInfo.id], (err, data) => {
        if(err) return res.status(500).json(err)
        return res.status(200).json(data)
   
    })

    })
}


const deleteUserReservations = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const reservationId = req.params.id

        const q = "DELETE FROM reservation WHERE `idreservation`= ? AND `user_id` = ?"

        db.query(q, [reservationId, userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your reservations.")

            return res.json("Reservation has been deleted")

        })
    })
}


const deleteUser= (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        

        const q = "DELETE FROM users where `idusers` = ?;"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your profile.")

            return res.json("Your profile has been deleted.")

        })
    })
}




const getAllUsers = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")
        //we need to make sure if the person with userInfo.id is an admin

        
        //It might need some limit since if I have a lot of users I shouldn't show all of them at once.
        const q = "SELECT idusers, username, email, first_name, last_name, type from users where idusers != ?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)

            return res.status(200).json(data)

        })
    })

}


const updateManagedUser = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        //we need to make sure if the person with userInfo.id is an admin
        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can change others profile")

            const values = [
                req.body.username,
                req.body.firstName,
                req.body.lastName,
                req.body.email,
                req.body.type,
               

            ]

            const q = "UPDATE users set username=?, first_name=?, last_name=?, email=?, type = ?  where idusers = ?"

            db.query(q, [...values,req.params.id], (err, data) => {
                if (err) return res.status(500).json(err)
                
                return res.status(200).json("User has been updated")
            })



        })




    })
}


const deleteManagedUser= (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        //we need to make sure if the person with userInfo.id is an admin
        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can change others profile")

            const q = "DELETE FROM users where `idusers` = ?;"

            db.query(q, [req.params.id], (err, data) => {
            if(err) return res.status(500).json(err)

            return res.json("The profile has been deleted.")

        })
    })
})
}



const getAllReports = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [userInfo.id], (err, data) => {
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




    })

}

const getAllReportsForPost = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can list reported posts")

            const q = `select * from reports where post_id = ?`

             db.query(q, [req.params.id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)
             })

        })




    })

}

const deleteReportsByPost = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "SELECT * from users where type='admin' and idusers = ?"

        db.query(q, [userInfo.id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only admin can delete reports.")
        
        
            const q = "delete from reports where post_id = ?"

            db.query(q, [req.params.post_id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json("The reports to this post has been deleted.")

            })
        
        
        })
    })

}

const getAllReservationsByRestaurant = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?"

        db.query(q, [userInfo.id,req.params.restaurant_id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only the restaurant's worker can get the data.")
        
        
            const q = "select * from reservation where restaurant_id = ?"

            db.query(q, [req.params.restaurant_id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        
        
        })
    })

}

const updateReservationStatus = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "SELECT * from users where type='restaurant worker' and idusers = ? and restaurant_id = ?"

        db.query(q, [userInfo.id,req.params.restaurant_id], (err, data) => {
            if(err) return res.status(500).json(err)
            if (data.length === 0) return res.status(403).json("Only the restaurant's worker can modify the data.")
        
        
            const q = "update reservation set status = ?  where idreservation = ? "

            db.query(q, [req.body.status, req.params.id], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        
        
        })
    })

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
    updateReservationStatus
   
}

