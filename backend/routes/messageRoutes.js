const express = require("express");
const router = express.Router();

const { getMessages, sendMessage } = require("../controllers/MessageController");
const { getMessage, deleteMessage } = require("../controllers/dashboardController");

router.get("/message/get", getMessage);
router.delete("/message/delete/:id", deleteMessage);


router.get("/messages", getMessages);
router.post("/send", sendMessage);

module.exports = router;
