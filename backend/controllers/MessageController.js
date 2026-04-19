const Message = require('../models/MessageSchema.js')

const sendMessage = async (req, res) => {
    try {
        const { sender, receiver, message } = req.body;

        if (!sender || !receiver || !message) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const newMessage = new Message({
            sender,
            receiver,
            message
        });

        await newMessage.save();

        res.status(201).json({
            message: "Message sent successfully"
        });

    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
}

const getMessage = async (req, res) => {
    try {
        const { sender, receiver } = req.body;

        if (!sender || !receiver) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const messages = await Message.find({
            sender,
            receiver
        });

        res.status(200).json(messages);

    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
}

const deleteMessage = async (req,res) =>{
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                message: "Message ID is required"
            });
        }

        const message = await Message.findByIdAndDelete(id);

        if (!message) {
            return res.status(404).json({
                message: "Message not found"
            });
        }

        res.status(200).json({
            message: "Message deleted successfully"
        });

    } catch (e) {
        res.status(500).json({
            message: e.message
        });
    }
}