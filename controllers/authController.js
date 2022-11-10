const User = require('../models/User')
const bcrypt = require('bcrypt')
const jwt = require("jsonwebtoken")
// const asyncHandler = require('express-async-handler')

//@desc login
//@route POST /auth
//@access Public
const login = async (req, res) => {
    const {username, password} = req.body

    // validate fields
    if( !username || !password){
        return res.status(400).json({message: 'All fields are required'})
    }

    // check if user exists or active
    const foundUser = await User.findOne({username}).exec()
    if(!foundUser || !foundUser.active){
        return res.status(401).json({message: "Unauthorized"})
    }

    // compare password
    const match = await bcrypt.compare(password, foundUser.password)
    if(!match) return res.status(401).json({message: "Unauthorized"})

    // create accessToken
    const accessToken = jwt.sign(
        {
            "UserInfo": {
                "username": foundUser.username,
                "roles": foundUser.roles
            }
        },
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
    )

    // create refresh token
    const refreshToken = jwt.sign(
        {"username": foundUser.username},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn: "1d"}
    )

    // create httpOnly cookie

    res.cookie('jwt', refreshToken, {
        httpOnly: true, // accessible only by web server
        secure: true, // https
        sameSite: "None", // cross-site cookie
        maxAge: 7 * 24 * 60 * 60 * 1000 // cookie expiry: set to match refresh token
    })

    // send accessToken containing username and roles
    res.json({accessToken})
}

//@desc refresh
//@route GET /auth/refresh

// @desc Refresh
// @route GET /auth/refresh
// @access Public - because access token has expired
const refresh =  (req, res) => {
    const cookies = req.cookies

    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' })

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET,
        async (err, decoded) => {
            if (err) return res.status(403).json({ message: 'Forbidden' })

            const foundUser = await User.findOne({ username: decoded.username }).exec()

            if (!foundUser) return res.status(401).json({ message: 'Unauthorized' })

            const accessToken = jwt.sign(
                {
                    "UserInfo": {
                        "username": foundUser.username,
                        "roles": foundUser.roles
                    }
                },
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        })
    
}

//@desc logout
//@route GET /auth/logout
//@access Public - just to clear the cookie if exists
const logout = async (req, res) => {
    const cookies = req.cookies
    if(!cookies?.jwt) return res.sendStatus(204) // No-content
    // remove the cookie when the user decide to manually logout
    res.clearCookie('jwt', {httpOnly: true, sameSite: 'None', secure: true})
    res.json({message: "Cookie cleared"})
}

module.exports = {
    login,
    refresh,
    logout
}