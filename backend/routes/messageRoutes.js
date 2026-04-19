const express = require("express");
const router = express.Router();

const { sendMessage, getMessage, deleteMessage } = require("../controllers/MessageController.js");

router.post("/send", sendMessage);
router.post("/get", getMessage);
router.delete("/delete/:id", deleteMessage);

module.exports = router;
