const express = require('express')
const router = express.Router()
const {getAllNotes, createNote, updateNote, deleteNote} = require('../controllers/notesController')
const verifyToken = require('../middleware/verifyToken')

router.use(verifyToken)

router.route('/')
    .get(getAllNotes)
    .post(createNote)
    .patch(updateNote)
    .delete(deleteNote)

module.exports = router