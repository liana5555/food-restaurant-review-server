const db = require('../db')
const jwt = require('jsonwebtoken')


/*
const getMessages = (req, res) => {
    console.log(`Getting messages from ${req.params.fromid}`)
}
*/

const getAllUsers = (req, res) => {
    const token = req.cookies.access_token
  
    

    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = `select idusers, username, first_name, last_name, img from users where first_name like concat('%', ?, '%') or last_name like concat('%', ?, '%') or username like concat('%', ?, '%') order by last_name asc`
        
       
      

        db.query(q, [req.query.q, req.query.q, req.query.q], (err, data) => {
            if (err) return res.status(500).send(err)
           // return res.status(200).json(data)
            return res.status(200).json(data.splice(0,10))
        })
    })


}


const postMessage = (req, res) => {

    //CHECK USER BEFORE SENDING MESSAGE
    const token = req.cookies.access_token

    
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "select * from group_member where user_id=? and conversation_id = ?"

        db.query(q, [userInfo.id, req.body.conversation_id], (err, data) => {
            if(err) return res.status(500).send(err)
            if (data.length === 0) return res.status(404).json("You are not part of this conversation")


            const q = 'insert into message(`message_text`, `sent_datetime`, `from_id`, `conversation_id`) VALUES(?) '

            const values = [
                req.body.message_text,
                req.body.sent_datetime,
                userInfo.id,
                req.body.conversation_id
            ]

            db.query(q, [values], (err, data) => {
                if (err) return res.status(500).json(err)

                return res.status(200).json("Message was sent")

            })

        })

    })
}

async function queryCreateConv (req, res, userInfo) {

    const mysql = require('mysql2/promise');

    // get the promise implementation, we will use bluebird
    const bluebird = require('bluebird');

// create the connection, specify bluebird as Promise
    const connection = await mysql.createConnection({host:process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_DATABASE, password:process.env.DB_PASSWORD , Promise: bluebird});
    
    const q = "insert into conversation(conversation_name) VALUES(?)"
        console.log(req.body)

        const [rows, fields] = await connection.execute(q, [req.body.conversation_name])

        console.log(typeof(rows.insertId))
        console.log(typeof(req.body.group_members_ids[0]))
        console.log(typeof(req.body.joined_date))
               
    const q2 = 'insert into group_member(`user_id`, `conversation_id`, `joined_date`) VALUES ?'

    const length = req.body.group_members_ids.length
    console.log(rows)
    console.log(length)
    let values_2 = [];
    for(var i=0; i< length; i++) {
        member_id = req.body.group_members_ids[i]
        var values_here = [
            member_id,
            rows.insertId,
            req.body.joined_date
        ]
        values_2.push(values_here)
        
    }

    values_2.push([userInfo.id, rows.insertId, req.body.joined_date]) //Adding myself to the group

    console.log(values_2)
    
    //const[roww2, fields2] = await connection.execute(q2, [values_2])

    db.query(q2, [values_2], (err, data) => {
        if(err) return res.status(500).send(err)
        return res.status(200).json("Data has been added")
    })
    

     
        //console.log(fields)

    

}



function createConversation (req, res) {
    const token = req.cookies.access_token

    
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const insertId =  queryCreateConv(req, res, userInfo)
        console.log(insertId)

       

        


    })


}

const listAvavilableConversations = (req, res) => {
    const token = req.cookies.access_token

    
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = `
        select conversation_id, conversation_name, img, user_id, idgroup_member, joined_date from conversation conv
        join group_member g on conv.idconversation = g.conversation_id
            where user_id = ?
        `

        db.query(q, [userInfo.id], (err, data) => {
            if (err) return res.status(500).send(err)
            return res.status(200).json(data)
        })

})

}

const getMessages = (req, res) => {

    const token = req.cookies.access_token

    
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")


        const q = "select * from group_member where user_id=? and conversation_id = ?"

        db.query(q, [userInfo.id, req.params.id], (err, data) => {
            if(err) return res.status(500).send(err)
            if (data.length === 0) return res.status(404).json("You are not part of this conversation")

            const q = `
                            select idmessage,
                            message_text,
                            sent_datetime,
                            from_id,
                            conversation_id,
                            username as from_name,
                            img as from_img from message m
                            join users u on u.idusers=m.from_id
                            where conversation_id = ? order by sent_datetime asc
                        `

            db.query(q, [req.params.id], (err, data) => {
                if (err) return res.status(500).send(err)
                return res.status(200).json(data)
            } )
        } )
    })

}





module.exports = {
    getMessages,
    postMessage,
    getAllUsers,
    createConversation,
    listAvavilableConversations
     
  }
  