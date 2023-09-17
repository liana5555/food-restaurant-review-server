const db = require('../db')
const jwt = require('jsonwebtoken')


const addReport = (req, res ) => {
    const token = req.cookies.access_token
    if(!token) 
    return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) 
            return res.status(403).json("Token is not valid")

        //check if a report already existing to the post.
        const q = "select * from reports where post_id = ? and user_id = ?"

        db.query(q, [req.body.post_id, userInfo.id], (err, data) => {
            if (err) return res.status(500).json(err)
            if (data.length) return res.status(400).json("The post has already been reported")

            //MNot reported yet

            const q = "insert into reports(`post_id`, `user_id`, `date`, `type`, `other` ) values(?)"

            const values = [
                Number(req.body.post_id),
                userInfo.id,
                req.body.date,
                req.body.type,
                req.body.other
            ]

            db.query(q, [values], (err, data) => {
                if (err) return res.status(500).json(err)

                return res.status(200).json("You succesfully reported this entry.")

            })
        })


    })

}





module.exports = {
  addReport
   
}

