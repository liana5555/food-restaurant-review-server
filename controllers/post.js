const db = require("../db");
const jwt = require("jsonwebtoken");
const { isRestaurantWorker, isAdmin } = require("./users");

//const q = "SELECT * FROM posts order by idposts desc"

const getPosts = async (req, res) => {
  try {
    if (parseInt(req.query.low) === 0) {
      const q = `select max(idposts) as highest_id from posts`;
      const [latestId] = await db.execute(q); // Use async/await directly

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
      `;

      const [posts] = await db.query(q2, [latestId[0].highest_id]); // Use async/await directly

      return res.status(200).json(posts);
    } else {
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
      `;

      const [posts] = await db.query(q, [parseInt(req.query.low)]); // Use async/await directly

      return res.status(200).json(posts);
    }
  } catch (err) {
    console.error(err);
    return res.status(500);
  }
};

const getPostsForMenu = async (req, res) => {
  try {
    const q =
      "select * from posts where idposts!=? order by idposts desc LIMIT 0, 4 ";

    const [postsForMenu] = await db.query(q, [req.params.id]);

    return res.status(200).json(postsForMenu);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
};

const getPost = async (req, res) => {
  try {
    const q = `SELECT f.name as name_of_food,
     r.restaurant_name as name_of_restaurant,
     r.city as city,
      r.adress as address , r.idrestaurants, 
      p.idposts,
       u.username, p.title,
       p.desc, p.img, u.img as userImg,
       p.date, p.rating_of_food, p.rating_of_restaurant, 
       p.type as post_type from posts p 
       JOIN users u ON p.user_id=u.idusers
       JOIN food f on p.food_id = f.idfood 
       JOIN restaurants r on p.restaurant_id = r.idrestaurants where p.idposts = ?`;

    const [post] = await db.query(q, [req.params.id]);

    return res.status(200).json(post[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json("Internal server error");
  }
};

const postPostv2 = async (req, res) => {
  try {
    await postPostMain(req, res, req.userInfo);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

async function postPostMain(req, res, userInfo) {
  //Check if restaurant exist

  const q_select_restaurant =
    "select * from restaurants where restaurant_name=? and city = ?";
  const [rows, fields] = await db.execute(q_select_restaurant, [
    req.body.name_of_restaurant,
    req.body.city,
  ]);

  let restaurant_id;
  let food_id;

  if (rows.length !== 0) {
    restaurant_id = rows[0].idrestaurants;
  } else {
    const q_insert_restaurant =
      "Insert into restaurants(`restaurant_name`, `adress`, `city`) VALUES (?,?,?)";
    const [rows2, fields2] = await db.execute(q_insert_restaurant, [
      req.body.name_of_restaurant,
      req.body.address,
      req.body.city,
    ]);
    restaurant_id = rows2.insertId;
  }

  //Check if food exists

  const q_select_food =
    "select * from food where name=? and fk_to_restaurants = ?";
  const [rows3, fields3] = await db.execute(q_select_food, [
    req.body.name_of_food,
    restaurant_id,
  ]);

  if (rows3.length !== 0) {
    food_id = rows3[0].idfood;
  } else {
    const q_insert_food =
      "Insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)";
    const [rows4, fields4] = await db.execute(q_insert_food, [
      req.body.name_of_food,
      restaurant_id,
    ]);

    food_id = rows4.insertId;
  }

  const type_of_post = "post";

  const query =
    "Insert into posts(`title`, `desc`, `img`, `date`, `user_id`, `rating_of_food`, `rating_of_restaurant`, `food_id`, `restaurant_id`, `type`) VALUES(?,?,?,?,?,?,?,?,?,?)";
  const values = [
    req.body.title,
    req.body.desc,
    req.body.img,
    req.body.date,
    userInfo.id,
    req.body.rating_of_food,
    req.body.rating_of_restaurant,
  ];

  const [postPost] = await db.query(query, [
    ...values,
    food_id,
    restaurant_id,
    type_of_post,
  ]);

  return res.status(200).json("You succesfully created the post.");
}

const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    const adminResult = await isAdmin(req, res);

    if (adminResult.length === 0) {
      const q = "DELETE FROM posts WHERE `idposts`= ? AND `user_id` = ?";

      const [result] = await db.query(q, [postId, req.userInfo.id]);

      if (result.affectedRows === 0) {
        return res.status(403).json("You can only delete you own posts");
      }

      return res.json("Post has been deleted");
    } else {
      const q = "DELETE FROM posts WHERE `idposts`= ?";
      const [result] = await db.query(q, [postId]);
      return res.json("Post has been deleted");
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updatePost = async (req, res) => {
  //change this up to check the food and restaurant name first
  try {
    const postId = req.params.id;
    const q =
      "UPDATE posts SET `title`=?, `desc`=?, `img`=?,`rating_of_food`=?, `rating_of_restaurant`=? WHERE `idposts` = ? and `user_id`=?";
    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.rating_of_food,
      req.body.rating_of_restaurant,
    ];
    const [result] = await db.query(q, [...values, postId, req.userInfo.id]);

    return res.status(200).json("Post has been updated");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const updateAdvertisement = async (req, res) => {
  try {
    const [restaurantWorker] = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    updateAdvertisementMain(req, res, req.userInfo);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const postAdvertisement = async (req, res) => {
  try {
    const restaurantWorker = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    const q2 =
      "Insert into posts (`title`, `desc`, `img`, `rating_of_food`,`rating_of_restaurant`, `type`, `date`,`restaurant_id`, `food_id`, `user_id`) VALUES(?,?,?,?,?,?,?,?, ?,?)";

    const values = [
      req.body.title,
      req.body.desc,
      req.body.img,
      req.body.rating_of_food,
      req.body.rating_of_restaurant,
      "advertisement",
      req.body.date,
      req.body.restaurant_id,
    ];

    updatePostAdvertisementMain(req, res, req.userInfo, q2, values);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

async function updateAdvertisementMain(req, res, userInfo) {
  const q = "select * from  food where name = ?";

  const [rows, fields] = await db.execute(q, [req.body.name_of_food]);
  //Food is not found so we need to insert
  let food_id;
  if (rows.length === 0) {
    //INSERT FOOD INTO THE DATABASE
    const q_food_insert =
      "insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)";
    const [rows2, fields2] = await db.execute(q_food_insert, [
      req.body.name_of_food,
      req.body.restaurant_id,
    ]);

    console.log(rows2);
    food_id = rows2.insertId;
  } else {
    food_id = rows[0].idfood;
  }

  //UPDATTING ADVERTISEMENT

  const q2 =
    "UPDATE posts SET `title`=?, `desc`=?, `img`=?,`rating_of_food`=?, `rating_of_restaurant`=? ,`type`=?, `food_id`=? WHERE `idposts` = ? and `user_id`=?";

  const values = [
    req.body.title,
    req.body.desc,
    req.body.img,
    req.body.rating_of_food,
    req.body.rating_of_restaurant,
    "advertisement",
    food_id,
    req.params.id,
  ];

  const [result] = await db.query(q2, [...values, userInfo.id]);

  return res.status(200).json("You succesfully updated your Advertisement.");
}

async function updatePostAdvertisementMain(req, res, userInfo, query, values) {
  const q = "select * from  food where name = ?";

  const [rows, fields] = await db.execute(q, [req.body.name_of_food]);
  //Food is not found so we need to insert
  let food_id;
  if (rows.length === 0) {
    //INSERT FOOD INTO THE DATABASE

    const q_food_insert =
      "insert into food(`name`, `fk_to_restaurants`) VALUES(?,?)";
    const [rows2, fields2] = await db.execute(q_food_insert, [
      req.body.name_of_food,
      req.body.restaurant_id,
    ]);

    console.log(rows2);
    food_id = rows2.insertId;
  } else {
    food_id = rows[0].idfood;
  }

  //Creating ADVERTISEMENT

  const [result] = await db.query(query, [...values, food_id, userInfo.id]);

  return res.status(200).json("You succesfully created your Advertisement.");
}

const deleteAdvertisement = async (req, res) => {
  try {
    const restaurantWorker = await isRestaurantWorker(req, res);

    if (restaurantWorker.length === 0) {
      return res
        .status(403)
        .json("Only restaurant wokers at this restaurant can access this.");
    }

    const postId = req.params.id;

    const q = "DELETE FROM posts WHERE `idposts`= ? AND `restaurant_id`=?";

    const [result] = await db.query(q, [postId, req.query.rid]);
    return res.json("Post has been deleted");
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

module.exports = {
  getPosts,
  getPost,
  //postPost,
  deletePost,
  updatePost,
  updateAdvertisement,
  postAdvertisement,
  postPostv2,
  getPostsForMenu,
  deleteAdvertisement,
};
