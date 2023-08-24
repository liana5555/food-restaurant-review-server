const db = require('../db')
const jwt = require('jsonwebtoken')




const getPosts = (req, res) => {
    const q = "SELECT * FROM posts order by idposts desc"

    db.query(q,(err, data) => {
        if(err) return res.status(500).send(err)

        return res.status(200).json(data)

    })
}

const getPost = (req, res) => {
    //Later join this on food and restaurant tables as well
    //cause we need the food name and the restaurant name as well
    
   // const q = "SELECT p.idposts, `username`, `title`, `desc`, p.img, u.img as userImg, `date`, `rating_of_food`, `rating_of_restaurant` from posts p JOIN users u ON p.user_id=u.idusers where p.idposts=? "

    const q = "SELECT f.name as name_of_food, r.restaurant_name as name_of_restaurant,p.idposts, `username`, `title`, `desc`, p.img, u.img as userImg, `date`, `rating_of_food`, `rating_of_restaurant` from posts p JOIN users u ON p.user_id=u.idusers JOIN food f on p.food_id = f.idfood JOIN restaurants r on p.restaurant_id = r.idrestaurants where p.idposts = ?"

    db.query(q,[req.params.id], (err, data) => {
        if(err) return res.status(500).json(err)

        return res.status(200).json(data[0])
    })
}

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

       /*
        Let's create another function out of this part and then add that as a callback.
       */
        /*
        const q = "INSERT INTO posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`) VALUES (?)"
        const values = [
        req.body.title,
        req.body.desc,
        req.body.img,
        req.body.date,
        userInfo.id,
        req.body.rating_of_food,
        req.body.rating_of_restaurant
        
    ]
    db.query(q, [values], (err, data) => {
        if(err) return res.status(500).json(err)

        return res.status(200).json("Post has been created")
    }) */
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



module.exports = {
    getPosts,
    getPost,
    postPost, 
    deletePost,
    updatePost
}