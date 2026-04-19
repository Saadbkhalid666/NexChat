const express = require('express')
const router = express.Router()

const { registerUser, getUser } = require('../controllers/UserController.js')

router.post('/register', registerUser)
router.get('/get-users', getUser)


module.exports = router

