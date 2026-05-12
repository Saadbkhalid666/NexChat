const express =  require('express')
const authMiddleware = require('../middleware/authMiddleware')

const { getMessage, deleteMessage, deleteUser, getUsers } = require('../controllers/dashboardController')
const adminMiddleware = require('../middleware/adminMiddleware')
const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

router.get('/messages',getMessage)
router.delete('/message/:id',deleteMessage)
router.delete('/user/:id',deleteUser)
router.get('/users',getUsers)

module.exports = router