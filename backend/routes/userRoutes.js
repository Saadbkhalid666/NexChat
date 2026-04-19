const express = require('express')
const router = express.Router()

const { registerUser, getUser, loginUser } = require('../controllers/UserController.js')
const authMiddleware = require('../middleware/authMiddleware.js')

router.post('/register', registerUser)
router.post('/login', loginUser)
router.get('/get-users',authMiddleware, getUser)


module.exports = router

