const express = require("express")
const router = express.Router()
const {getAllUsers, createUser, updateUser, deleteUser} = require('../controllers/usersController')
const verifyToken = require('../middleware/verifyToken')

router.use(verifyToken)

router.route("/")
    .get(getAllUsers)
    .post(createUser)
    .patch(updateUser)
    .delete(deleteUser)

module.exports = router