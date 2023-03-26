const db = require('../db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')


const getReg = (req, res) => {
    res.json({succes: true, message: "This is working"})
}

const Register = (req, res) => {

    
    //CHECK EXISTING USER

    const query = "SELECT * FROM users WHERE email = ? OR username = ?"

    db.query(query, [req.body.email, req.body.username], (err, data) => {
        if(err) return res.json(err)
        if(data.length) return res.status(409).json("User already exists!");
            //Hash the password and create a user
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        const query2 = "insert into users(`username`, `first_name`, `last_name`, `email`, `password`) values(?,?,?,?,?)"

        db.query(query2, [req.body.username, req.body.firstName, req.body.lastName, req.body.email, hash], (err, data)=> {
            if (err) return res.json(err)
            return res.status(200).json("User has been created")

        })


        


    })

}

const Login = (req, res) => {
        //CHECK IF OUR USER EXISTS

        const query = "SELECT * FROM users where username = ?"

        db.query(query, [req.body.username], (err, data)=> {
            if(err) return res.json(err)
            if(data.length === 0) return res.status(404).json("User is not found!")


            //CHECK THE PASSWORD
            const isPasswordCorrect =  bcrypt.compareSync(req.body.password, data[0].password)

            if(!isPasswordCorrect) return res.status(400).json("Wrong username or pasword")
            const token = jwt.sign({id: data[0].idusers}, process.env.KEY_FOR_JWT); //a secret key should be generated and stored in the env file.
            const {password, ...other} = data[0]

            res.cookie("access_token", token, {
                httpOnly: true,
            }).status(200).json(other)

            
        })
    
}

const Logout = (req, res) => {

    res.clearCookie("access_token", {
        sameSite:"none", 
        secure:true
    }).status(200).json("User has been logged out")
    
}

module.exports = {
    Register,
    Login,
    Logout, getReg
}