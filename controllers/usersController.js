const User = require("../models/User")
const Note = require("../models/Note")
// const asyncHandler = require('express-async-handler')
const bcrypt = require('bcrypt')

//@desc Get all users 
//@route GET /users
//@access Private
const getAllUsers = async (req, res) => {
    const users = await User.find().select('-password').lean()
    if(!users?.length) return res.status(400).json({message: "No users found"})
    res.json(users)
}

//@desc Create user 
//@route POST /users
//@access Private
const createUser = async (req, res) => {
    const {username, password, roles} = req.body
    // confirm data
    if(!username || !password ){
        return res.status(400).json({message: "All fields are required"})
    }

    // Check for duplicate  - collation for case insensitivity
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()
    if(duplicate) return res.status(409).json({message: "Duplicate username"})

    // hashpassword
    const hashedPassword = await bcrypt.hash(password, 10)
    const userObject =  (!Array.isArray(roles) || !roles.length) 
        ? {username, "password": hashedPassword}
        : {username, "password": hashedPassword, roles}
    const user = await User.create(userObject)
    if(user){
        res.status(201).json({message: `New user ${username} created`})
    } else {
        res.status(400).json({messsage: 'Invalid user data received'})
    }
}

//@desc Update user 
//@route PATCH /users
//@access Private
const updateUser = async (req, res) => {
    const {id, username, roles, active, password} = req.body 
    // confirm data
    if(!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
        return res.status(400).json({message: "All fields are required"})
    }

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({message: 'User not found'})

    //check for duplicate -  collation for case insensitivty
    const duplicate = await User.findOne({username}).collation({locale: 'en', strength: 2}).lean().exec()
    // allow updates to the original user 
    if(duplicate && duplicate?._id.toString() !== id){
        return res.status(409).json({message: 'Duplicate username'})
    }

    user.username = username
    user.roles = roles
    user.active = active
    if(password){
        // hashed password
        user.password = await bcrypt.hash(password, 10)
    }

    const updatedUser = await user.save()
    res.status(200).json({message: `${updatedUser.username} updated`})
}

//@desc Delete user 
//@route DELETE /users
//@access Private
const deleteUser = async (req, res) => {
    const {id} = req.body
    if(!id) return res.status(400).json({message: "User id required"})

    const note = await Note.findOne({user: id}).lean().exec()
    if(note) return res.status(400).json({message: 'User has assigned notes'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({message: 'User not found'})

    const result = await user.deleteOne()
    res.status(200).json({message: `Username ${result.username} with ID ${result._id} deleted`})
}

module.exports = {getAllUsers, createUser, updateUser, deleteUser}