const fileUpload = require("express-fileupload")
const express = require('express')
const router = express.Router()
const filesPayloadExists = require("../middleware/filesPayloadExists")
const fileExtLimiter = require("../middleware/fileExtLimiter")
const fileSizeLimiter = require("../middleware/fileSizeLimiter")
const path = require("path")

router.post("/", 
    fileUpload({createParentPath: true}),  
    filesPayloadExists,
    fileExtLimiter(['.png', '.jpg', '.jpeg']),
    fileSizeLimiter,
    (req, res) => {
    const files = req.files
    console.log(files)

    Object.keys(files).forEach(key => {
        const filePath = path.join(__dirname, "..", "files", files[key].name)
        files[key].mv(filePath, (err) => {
            if(err) return res.status(500).json({status: "error", message: err})
        })
    })

    return res.json({status: "success", message: Object.keys(files).toString()})
})

module.exports = router
