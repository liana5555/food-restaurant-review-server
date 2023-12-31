const jwt = require('jsonwebtoken')


function jwtVerifyUser (req, res, next) {
    const token = req.cookies.access_token
    if(!token) return res.status(401).json("Not authenticated")

    jwt.verify(token,process.env.KEY_FOR_JWT, (err, userInfo) => {
        if(err) return res.status(403).json("Token is not valid")

        req.userInfo = userInfo

        next()

    })
}

module.exports = {
    jwtVerifyUser
}