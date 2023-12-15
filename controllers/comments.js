const db = require('../db')
const jwt = require('jsonwebtoken')



const getComments = (req, res) => {
   
    if (parseInt(req.query.low) === 0) {
        const q = "select max(idcomments) as highest_id from comments where post_id = ?"

        db.query(q, [req.params.postid], (err, data) => {
            if(err) return res.status(500).send(err)

            const highest = data[0].highest_id
            

            const q2 = `
            SELECT 
                    c.idcomments,c.comment, c.replied_for,
                    c.comment_date, c.user_id, c.post_id, 
                    u.username, u.img, u.type,
                    count(r.idreports) as reports
                    FROM comments c join users u on c.user_id = u.idusers
                    left join reports r on c.idcomments = r.comment_id
                 where c.post_id=? and replied_for is null
                 group by c.idcomments having reports < 100 and idcomments <= ?
                 order by c.idcomments desc
                 LIMIT 0,10
            `
            db.query(q2, [req.params.postid, highest], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        })
    }
    else {
            const q = `
            SELECT 
            c.idcomments, 
            c.comment,
            c.replied_for,
            c.comment_date, 
            c.user_id, 
            c.post_id, 
            u.username, 
            u.img, 
            u.type,
            count(r.idreports) as reports
            FROM comments c join users u on c.user_id = u.idusers
            left join reports r on c.idcomments = r.comment_id
         where c.post_id=? and replied_for is null
         group by c.idcomments having reports < 100 and idcomments < ?
         order by c.idcomments desc
         LIMIT 0,10
        `
      
        db.query(q,[req.params.postid ,parseInt(req.query.low)], (err, data) => {
            if(err) return res.status(500).send(err)

            return res.status(200).json(data)

        })
    }
   

}


/*
const getComments = (req, res) => {
    //const q = "SELECT * FROM comments where post_id=? and replied_for is null"
   const q = `SELECT 
                    c.idcomments, 
                    c.comment,
                    c.replied_for,
                    c.comment_date, 
                    c.user_id, 
                    c.post_id, 
                    u.username, 
                    u.img, 
                    u.type FROM comments c join users u on c.user_id = u.idusers
                 where post_id=? and replied_for is null`

    db.query(q,[req.params.postid],(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })
}
*/


const getReplies= (req, res) => {
    
    const q = `SELECT 
                    c.idcomments, 
                    c.comment,
                    c.replied_for,
                    c.comment_date, 
                    c.user_id, 
                    c.post_id, 
                    u.username, 
                    u.img, 
                    u.type FROM comments c join users u on c.user_id = u.idusers
                 where post_id=? and replied_for=?`

    const values = [
        req.params.postid,
        req.params.commentid
    ]

    db.query(q,values,(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })

}



/*const getReplies = (req, res) => {
   
    if (parseInt(req.query.low) === 0) {
        const q = "select max(idcomments) as highest_id from comments where post_id = ?"

        db.query(q, [req.params.postid], (err, data) => {
            if(err) return res.status(500).send(err)

            const highest = data[0].highest_id
            

            const q2 = `
            SELECT 
                    c.idcomments,c.comment, c.replied_for,
                    c.comment_date, c.user_id, c.post_id, 
                    u.username, u.img, u.type,
                    count(r.idreports) as reports
                    FROM comments c join users u on c.user_id = u.idusers
                    left join reports r on c.idcomments = r.comment_id
                 where c.post_id=? and replied_for =?
                 group by c.idcomments having reports < 100 and idcomments <= ?
                 order by c.idcomments desc
                 LIMIT 0,10
            `
            db.query(q2, [req.params.postid,req.params.commentid, highest], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        })
    }
    else {
            const q = `
            SELECT 
            c.idcomments, 
            c.comment,
            c.replied_for,
            c.comment_date, 
            c.user_id, 
            c.post_id, 
            u.username, 
            u.img, 
            u.type,
            count(r.idreports) as reports
            FROM comments c join users u on c.user_id = u.idusers
            left join reports r on c.idcomments = r.comment_id
         where c.post_id=? and replied_for = ?
         group by c.idcomments having reports < 100 and idcomments < ?
         order by c.idcomments desc
         LIMIT 0,10
        `
      
        db.query(q,[req.params.postid,req.params.commentid ,parseInt(req.query.low)], (err, data) => {
            if(err) return res.status(500).send(err)

            return res.status(200).json(data)

        })
    }
   

}

*/


const postComments = (req, res) => {


        const q = "INSERT INTO comments(`comment`, `replied_for`, `comment_date`, `user_id`, `post_id`) VALUES(?)"

        const values = [
            req.body.comment,
            req.body.replied_for,
            req.body.date,
            req.userInfo.id,            
            req.body.postid
            
        ]

        db.query(q, [values], (err, data) => {
            if (err) return res.status(500).send(err)

            return res.status(200).json("Comment has been created")
        })



}

const deleteComments = (req, res) => {

        const commentId = req.params.commentid

        const q = "DELETE FROM comments WHERE `idcomments`= ? AND `user_id` = ?"

        db.query(q, [commentId, req.userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your posts.")

            return res.json("Comment has been deleted")

        })

}    



module.exports = {
    getComments,
    getReplies,
    postComments,
    deleteComments
}