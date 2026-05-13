const Message = require("../models/MessageSchema");

const getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    return res.status(200).json({ messages });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;

    if (!sender || !receiver || !message) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const newMsg = await Message.create({ sender, receiver, message });

    return res.status(201).json(newMsg);

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

module.exports = { getMessages, sendMessage };