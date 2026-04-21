const express =  require('express')
const authMiddleware = require('../middleware/authMiddleware')
const adminMiddleware = require('../middleware/adminMIddleware')
const router = express.Router()

router.use(authMiddleware)
router.use(adminMiddleware)

module.exports = router