const express = require("express");
const router = express.Router();

const { getMessages, sendMessages, deleteMessages } = require("../controllers/MessageController");

router.get("/get", getMessages);
router.post("/send", sendMessages);
router.delete("/delete/:id", deleteMessages);
router.get("/messages", getMessages);

module.exports = router;
