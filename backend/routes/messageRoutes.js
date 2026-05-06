const express = require("express");
const router = express.Router();

const { sendMessage, getMessage, deleteMessage } = require("../controllers/MessageController.js");

router.post("/send", sendMessage);
router.get("/get", getMessage);
router.delete("/delete/:id", deleteMessage);

module.exports = router;
