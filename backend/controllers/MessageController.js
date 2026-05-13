const Message = require("../models/MessageSchema");

const getMessages = async (req, res) => {
  try {
    const { sender, receiver } = req.query;
    let query = {};
    if (sender && receiver) {
      query = {
        $or: [
          { sender, receiver },
          { sender: receiver, receiver: sender }
        ]
      };
    }
    const messages = await Message.find(query).sort({ createdAt: 1 });
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