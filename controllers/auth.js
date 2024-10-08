const db = require("../db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const getReg = (req, res) => {
  res.json({ succes: true, message: "This is working" });
};

const Register = async (req, res) => {
  //CHECK EXISTING USER

  const query = "SELECT * FROM users WHERE email = ? OR username = ?";

  try {
    const [resultUser] = await db.query(query, [
      req.body.email,
      req.body.username,
    ]);
    if (resultUser.length) return res.status(409).json("User alreday exists");
    else {
      const salt = bcrypt.genSaltSync(10);
      const hash = bcrypt.hashSync(req.body.password, salt);
      const query2 =
        "insert into users(`username`, `first_name`, `last_name`, `email`, `password`) values(?,?,?,?,?)";

      const [insertUserResult] = await db.query(query2, [
        req.body.username,
        req.body.firstName,
        req.body.lastName,
        req.body.email,
        hash,
      ]);

      res.status(200).json("User has been created");
    }
  } catch (err) {
    console.log(err);
    if (err.code === "ER_DUP_ENTRY") {
      res.status(409).json("Username or email already in use");
    } else {
      res.status(500).json("Internal server error. Please try again later.");
    }
  }
};

const Login = async (req, res) => {
  //CHECK IF OUR USER EXISTS

  try {
    const query = "SELECT * FROM users where username = ?";

    const [foundUser] = await db.query(query, req.body.username);
    if (foundUser.length === 0)
      return res.status(404).json("User is not found");

    const isPasswordCorrect = bcrypt.compareSync(
      req.body.password,
      foundUser[0].password
    );

    if (!isPasswordCorrect)
      return res.status(400).json("Wrong username or pasword");
    const token = jwt.sign(
      { id: foundUser[0].idusers },
      process.env.KEY_FOR_JWT
    ); //a secret key should be generated and stored in the env file.
    const { password, ...other } = foundUser[0];

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(other);
  } catch (err) {
    console.log(err);
    return res.status(500).json("Internal server error");
  }
};

const Logout = (req, res) => {
  res
    .clearCookie("access_token", {
      sameSite: "none",
      secure: true,
    })
    .status(200)
    .json("User has been logged out");
};

module.exports = {
  Register,
  Login,
  Logout,
  getReg,
};
