const { Schema, model } = require("mongoose");

const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    message: {
        type: String,
        required: true
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const Message = model("Message", MessageSchema);

module.exports = Message;