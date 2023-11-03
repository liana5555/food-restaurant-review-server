const db = require('../db')
const jwt = require('jsonwebtoken')


 //const q = "SELECT * FROM posts order by idposts desc"

const getPosts = (req, res) => {

    if (parseInt(req.query.low) === 0) {
        const q = "select max(idposts) as highest_id from posts"

        db.query(q, (err, data) => {
            if(err) return res.status(500).send(err)

            const highest = data[0].highest_id

            const q2 = `
            SELECT p.idposts, p.title, p.desc,
            p.img, p.date, p.user_id, p.rating_of_food,
            p.rating_of_restaurant, p.food_id, p.restaurant_id,
            p.type, count(r.idreports) as reports 
            FROM posts p left join reports r
                on p.idposts = r.post_id
                group by p.idposts having reports < 100 and idposts <= ?
                order by p.idposts desc
                LIMIT 0, 10
            `
            db.query(q2, [highest], (err, data) => {
                if(err) return res.status(500).send(err)

                return res.status(200).json(data)

            })
        })
    }
    else {
            const q = `
        SELECT p.idposts, p.title, p.desc,
        p.img, p.date, p.user_id, p.rating_of_food,
        p.rating_of_restaurant, p.food_id, p.restaurant_id,
        p.type, count(r.idreports) as reports 
        FROM posts p left join reports r
            on p.idposts = r.post_id
            group by p.idposts having reports < 100 and idposts < ?
            order by p.idposts desc
            LIMIT 0, 10
        `
      
        db.query(q,[parseInt(req.query.low)], (err, data) => {
            if(err) return res.status(500).send(err)

            return res.status(200).json(data)

        })
    }
   
    
}

const getPostsForMenu = (req, res) => {
    const q = "select * from posts where idposts != ? order by idposts desc LIMIT 0, 4 "

    db.query(q,[req.params.id], (err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })

}
    //Later join this on food and restaurant tables as well
    //cause we need the food name and the restaurant name as well
    
   // const q = "SELECT p.idposts, `username`, `title`, `desc`, p.img, u.img as userImg, `date`, `rating_of_food`, `rating_of_restaurant` from posts p JOIN users u ON p.user_id=u.idusers where p.idposts=? "


const getPost = (req, res) => {

    const q = `SELECT f.name as name_of_food,
     r.restaurant_name as name_of_restaurant,
     r.city as city,
      r.adress as address ,
      p.idposts,
       u.username, p.title,
       p.desc, p.img, u.img as userImg,
       p.date, p.rating_of_food, p.rating_of_restaurant, 
       p.type as post_type from posts p 
       JOIN users u ON p.user_id=u.idusers
       JOIN food f on p.food_id = f.idfood 
       JOIN restaurants r on p.restaurant_id = r.idrestaurants where p.idposts = ?`

    db.query(q,[req.params.id], (err, data) => {
        if(err) return res.status(500).json(err)

        return res.status(200).json(data[0])
    })
}


/*
const postPost = (req, res) => {

    const token = req.cookies.access_token
    if(!token) 
    return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) 
            return res.status(403).json("Token is not valid")

        //I need restaurant_id and food_id later on but I will first have to check
        //if they restaurant_id and food_id exist in the database if they don't then I need to
        //insert them as well.
        const q_for_food_id = "SELECT idfood FROM food where name=?"

        db.query(q_for_food_id, req.body.name_of_food, (err, data_of_food) => {
            if (err) return res.status(500).json(err)
            if(data_of_food.length === 0) {
                const q_insert_food = "INSERT INTO food(`name`) VALUES(?) "
                db.query(q_insert_food, req.body.name_of_food, (err, result_of_food) => {
                    if (err) return res.json(err)
                    console.log("Food: Inserted into the database at id: " + result_of_food.insertId)

                    food_id = result_of_food.insertId

                    //From here getting the restaurant id or inserting the restaurant
                    
                    const q_for_restaurant_id = "SELECT * FROM restaurants where `restaurant_name` = ?"

                    db.query(q_for_restaurant_id, req.body.name_of_restaurant, (err, data_of_restaurant) => {
                        if(err) return res.status(500).json(err)
                        if(data_of_restaurant.length === 0) {
                            const q_insert_restaurant = "INSERT INTO restaurants(`restaurant_name`) VALUES(?) "
                            db.query(q_insert_restaurant, req.body.name_of_restaurant, (err, result_of_restaurant) => {
                                if (err) return res.json(err)
                                console.log("Restaurant: Inserted into the database at id: " + result_of_restaurant.insertId)
                                restaurant_id = result_of_restaurant.insertId
                                
                                //INSERTING INTO POSTS WITH FOOD_ID AND RESTAURANT_ID
                                const q = "INSERT INTO posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`) VALUES (?)"
                                
                                const values = [
                                    req.body.title,
                                    req.body.desc,
                                    req.body.img,
                                    req.body.date,
                                    userInfo.id,
                                    req.body.rating_of_food,
                                    req.body.rating_of_restaurant,
                                    food_id,
                                    restaurant_id
                                    
                                ]


                                db.query(q, [values], (err, data) => {
                                    if(err) return res.status(500).json(err)
                                
                                    return res.status(200).json("Post has been created")
                                })


                            })
                        } 
                        else {
                           
                            console.log("Got the data from the database at id: " + data_of_restaurant[0].idrestaurants)
                            restaurant_id = data_of_restaurant[0].idrestaurants

                            const q = "INSERT INTO posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`) VALUES (?)"
                                
                                const values = [
                                    req.body.title,
                                    req.body.desc,
                                    req.body.img,
                                    req.body.date,
                                    userInfo.id,
                                    req.body.rating_of_food,
                                    req.body.rating_of_restaurant,
                                    food_id,
                                    restaurant_id
                                    
                                ]


                                db.query(q, [values], (err, data) => {
                                    if(err) return res.status(500).json(err)
                                
                                    return res.status(200).json("Post has been created")
                                })
                            
                        }
                    
                    })


                    
                })
            } 
            else {
                console.log("Got the data from the database at id: " + data_of_food[0].idfood)
                food_id = data_of_food[0].idfood

                const q_for_restaurant_id = "SELECT * FROM restaurants where `restaurant_name` = ?"

                db.query(q_for_restaurant_id, req.body.name_of_restaurant, (err, data_of_restaurant) => {
                    if(err) return res.status(500).json(err)
                    if(data_of_restaurant.length === 0) {
                        const q_insert_restaurant = "INSERT INTO restaurants(`restaurant_name`) VALUES(?) "
                        db.query(q_insert_restaurant, req.body.name_of_restaurant, (err, result_of_restaurant) => {
                            if (err) return res.json(err)
                            console.log("Restaurant: Inserted into the database at id: " + result_of_restaurant.insertId)
                            restaurant_id = result_of_restaurant.insertId
                            
                            //INSERTING INTO POSTS WITH FOOD_ID AND RESTAURANT_ID
                            const q = "INSERT INTO posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`) VALUES (?)"
                            
                            const values = [
                                req.body.title,
                                req.body.desc,
                                req.body.img,
                                req.body.date,
                                userInfo.id,
                                req.body.rating_of_food,
                                req.body.rating_of_restaurant,
                                food_id,
                                restaurant_id
                                
                            ]


                            db.query(q, [values], (err, data) => {
                                if(err) return res.status(500).json(err)
                            
                                return res.status(200).json("Post has been created")
                            })


                        })
                    } 
                    else {
                       
                        console.log("Got the data from the database at id: " + data_of_restaurant[0].idrestaurants)
                        restaurant_id = data_of_restaurant[0].idrestaurants

                        const q = "INSERT INTO posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`) VALUES (?)"
                            
                            const values = [
                                req.body.title,
                                req.body.desc,
                                req.body.img,
                                req.body.date,
                                userInfo.id,
                                req.body.rating_of_food,
                                req.body.rating_of_restaurant,
                                food_id,
                                restaurant_id
                                
                            ]


                            db.query(q, [values], (err, data) => {
                                if(err) return res.status(500).json(err)
                            
                                return res.status(200).json("Post has been created")
                            })
                        
                    }
                
                })


                
            }


        })

   
})
}
*/
const postPostv2 = (req, res) => {
    const token = req.cookies.access_token
    if(!token) 
    return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) 
            return res.status(403).json("Token is not valid")

            postPostMain(req, res, userInfo)

        
        

    })

}

async function postPostMain (req, res, userInfo) {

    const mysql = require('mysql2/promise');

    // get the promise implementation, we will use bluebird
    const bluebird = require('bluebird');

// create the connection, specify bluebird as Promise
    const connection = await mysql.createConnection({host:process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_DATABASE, password:process.env.DB_PASSWORD , Promise: bluebird});


    //Check if restaurant exist

    const q_select_restaurant = "select * from restaurants where restaurant_name=? and city = ?"
    const [rows, fields] = await connection.execute(q_select_restaurant, [req.body.name_of_restaurant, req.body.city])

    let restaurant_id
    let food_id

    if (rows.length !== 0) {
        restaurant_id = rows[0].idrestaurants

    }
    else{
        const q_insert_restaurant = "Insert into restaurants(`restaurant_name`, `adress`, `city`) VALUES (?,?,?)"
        const [rows2, fields2] = await connection.execute(q_insert_restaurant, [req.body.name_of_restaurant, req.body.address, req.body.city])
        restaurant_id = rows2.insertId

    }

    //Check if food exists

    const q_select_food = "select * from food where name=? and fk_to_restaurants = ?"
    const [rows3, fields3] = await connection.execute(q_select_food, [req.body.name_of_food, restaurant_id])

    if (rows3.length !==0) {
        food_id = rows3[0].idfood
    }
    else {
        const q_insert_food = "Insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)"
        const [rows4, fields4] = await connection.execute(q_insert_food, [req.body.name_of_food, restaurant_id])

        food_id = rows4.insertId


    }

    const type_of_post= "post"

    const query = "Insert into posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`, `type`) VALUES(?,?,?,?,?,?,?,?,?,?)"
    const values = [
        req.body.title,
        req.body.desc,
        req.body.img, 
        req.body.date,
        userInfo.id,
        req.body.rating_of_food,
        req.body.rating_of_restaurant,
    ]

    db.query(query, [...values, food_id, restaurant_id, type_of_post], (err, data) => {
        if(err) return res.status(500).send(err)
        return res.status(200).json("You succesfully created the post.")
    })




}




const deletePost = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const postId = req.params.id

        const q = "DELETE FROM posts WHERE `idposts`= ? AND `user_id` = ?"

        db.query(q, [postId, userInfo.id], (err, data) => {
            if(err) return res.status(403).json("You can delete only your posts.")

            return res.json("Post has been deleted")

        })
    })
}


const updatePost = (req, res) => {
    
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        //I need restaurant_id and food_id later on but I will first have to check
        //if they restaurant_id and food_id exist in the database if they don't then I need to
        //insert them as well.
    const postId = req.params.id
    const q = "UPDATE posts SET `title`=?, `desc`=?, `img`=?,`rating_of_food`=?, `rating_of_restaurant`=? WHERE `idposts` = ? and `user_id`=?"
    const values = [
        req.body.title,
        req.body.desc,
        req.body.img,
        req.body.rating_of_food,
        req.body.rating_of_restaurant,
    ]
    db.query(q, [...values,postId, userInfo.id ], (err, data) => {
        if(err) return res.status(500).json(err)

        return res.status(200).json("Post has been created")
    })
})
}

const updateAdvertisement = (req, res) => {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        //Checkin the user is a restaurant worker

        const q = "Select * from users where idusers = ? and restaurant_id = ?"

        db.query(q, [userInfo.id, req.body.restaurant_id], (err, data) => {
            if (err) return res.status(500).send(err)
            if (data.length === 0) {
                return res.status(403).json("Only restaurant workers can write advertisement")
            }

           
  
        })
/*
        const q2 = "UPDATE posts SET `title`=?, `desc`=?, `img`=?,`rating_of_food`=?, `rating_of_restaurant`=? `type`=? WHERE `idposts` = ? and `user_id`=?"

        const values = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.rating_of_food,
            req.body.rating_of_restaurant,
                
        ]
*/
 

        //Checking name of food in the database if
        // it is not there inserting it 
        // and getting it's insertID
        //if it's there getting it's id

        updateAdvertisementMain(req, res, userInfo)




    })

}

const postAdvertisement = (req, res) => {

    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        const q = "Select * from users where idusers = ? and restaurant_id = ?"

        db.query(q, [userInfo.id, req.body.restaurant_id], (err, data) => {
            if (err) return res.status(500).send(err)
            if (data.length === 0) {
                return res.status(403).json("Only restaurant workers can write advertisement")
            }

        })



        const q2 = "Insert into posts (`title`, `desc`, `img`, `rating_of_food`,`rating_of_restaurant`, `type`, `date`,`restaurant_id`, `food_id`, `user_id`) VALUES(?,?,?,?,?,?,?,?, ?,?)"

        const values = [
            req.body.title,
            req.body.desc,
            req.body.img,
            req.body.rating_of_food,
            req.body.rating_of_restaurant,
            "advertisement", 
            req.body.date,
            req.body.restaurant_id
      
    ]

    updatePostAdvertisementMain(req, res, userInfo, q2, values)

    })


}



async function updateAdvertisementMain(req, res, userInfo) {

    const mysql = require('mysql2/promise');

    // get the promise implementation, we will use bluebird
    const bluebird = require('bluebird');

// create the connection, specify bluebird as Promise
    const connection = await mysql.createConnection({host:process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_DATABASE, password:process.env.DB_PASSWORD , Promise: bluebird});
    
    const q = "select * from  food where name = ?"
       

        const [rows, fields] = await connection.execute(q, [req.body.name_of_food])
    //Food is not found so we need to insert
        let food_id
        if (rows.length === 0) {
            //INSERT FOOD INTO THE DATABASE
            //Maybe I should do this in try and catch block
            const q_food_insert = "insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)"
            // try {
                //const [rows2, fields2] = await .....
            //}
            //catch(err){
                //return res.status(500).send(err)
            //}
            const [rows2, fields2] =  await connection.execute(q_food_insert, [req.body.name_of_food, req.body.restaurant_id])

            console.log(rows2)
            food_id = rows2.insertId

        }
        else {
            food_id = rows[0].idfood
        }

    //UPDATTING ADVERTISEMENT

    const q2 = "UPDATE posts SET `title`=?, `desc`=?, `img`=?,`rating_of_food`=?, `rating_of_restaurant`=? ,`type`=?, `food_id`=? WHERE `idposts` = ? and `user_id`=?"

    const values = [
        req.body.title,
        req.body.desc,
        req.body.img,
        req.body.rating_of_food,
        req.body.rating_of_restaurant,
        "advertisement", 
        food_id,
        req.params.id,
      
    ]

    db.query(q2, [...values, userInfo.id], (err, data) => {
        if (err) return res.status(500).send(err)

        return res.status(200).json("You succesfully updated your Advertisement.")
    })
   

}

async function updatePostAdvertisementMain(req, res, userInfo, query, values) {

    const mysql = require('mysql2/promise');

    // get the promise implementation, we will use bluebird
    const bluebird = require('bluebird');

// create the connection, specify bluebird as Promise
    const connection = await mysql.createConnection({host:process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_DATABASE, password:process.env.DB_PASSWORD , Promise: bluebird});
    
    const q = "select * from  food where name = ?"
       

        const [rows, fields] = await connection.execute(q, [req.body.name_of_food])
    //Food is not found so we need to insert
        let food_id
        if (rows.length === 0) {
            //INSERT FOOD INTO THE DATABASE
            //Maybe I should do this in try and catch block
            const q_food_insert = "insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)"
            // try {
                //const [rows2, fields2] = await .....
            //}
            //catch(err){
                //return res.status(500).send(err)
            //}
            const [rows2, fields2] =  await connection.execute(q_food_insert, [req.body.name_of_food, req.body.restaurant_id])

            console.log(rows2)
            food_id = rows2.insertId

        }
        else {
            food_id = rows[0].idfood
        }

    //UPDATTING ADVERTISEMENT

    db.query(query, [...values, food_id, userInfo.id], (err, data) => {
        if (err) return res.status(500).send(err)

        return res.status(200).json("You succesfully updated your Advertisement.")
    })
   

}


module.exports = {
    getPosts,
    getPost,
    //postPost, 
    deletePost,
    updatePost,
    updateAdvertisement,
    postAdvertisement,
    postPostv2,
    getPostsForMenu
}