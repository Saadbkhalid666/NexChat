const express =  require('express')
const authMiddleware = require('../middleware/authMiddleware')

const { getMessage, deleteMessage, deleteUser, getUsers } = require('../controllers/dashboardController')
const adminMiddleware = require('../middleware/adminMiddleware')
const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/dashboard/messages',getMessage)
router.delete('/dashboard/message/:id',deleteMessage)
router.delete('/dashboard/user/:id',deleteUser)
router.get('/dashboard/users',getUsers)

module.exports = router