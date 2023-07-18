const db = require('../db')
const jwt = require('jsonwebtoken')





const getComments = (req, res) => {
    const q = "SELECT * FROM comments where post_id=? and replied_for is null"
   

    db.query(q,[req.params.postid],(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })
}

const getReplies= (req, res) => {
    const q = "SELECT * FROM comments where post_id=? and replied_for=?"

    const values = [
        req.params.postid,
        req.params.commentid
    ]

    db.query(q,values,(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })

}


const postComments = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "INSERT INTO comments(`comment`, `replied_for`, `comment_date`, `user_id`, `post_id`) VALUES(?)"

        const values = [
            req.body.comment,
            req.body.replied_for,
            req.body.date,
            userInfo.id,            
            req.body.postid
            
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).send(err)

            return res.status(200).json("Comment has been created")
        })

    })

}

const deleteComments = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const commentId = req.params.commentid

        const q = "DELETE FROM comments WHERE `idcomments`= ? AND `user_id` = ?"

        db.query(q, [commentId, userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your posts.")

            return res.json("Post has been deleted")

        })
    })
}    



module.exports = {
    getComments,
    getReplies,
    postComments,
    deleteComments
}