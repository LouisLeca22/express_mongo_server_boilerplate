const allowedOrigins = require("./allowedOrigins")

const corsOptions = {
    origin: (origin, callback) => {
        // no-origin for postman
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    // httpCookies
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions

