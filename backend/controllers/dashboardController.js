const User = require('../models/UserSchema')
const Message = require('../models/MessageSchema')
const getMessage = async (req,res) =>{
    try {
        const messages = await Message.find()
        res.status(200).json({message:"Messages fetched successfully",messages})

    } catch (error) {
     res.status(500).json({message:"Internal Server Error",error:error.message})   
    }
}

const deleteMessage = async (req,res) => {
    try{

        const id = req.params
        const message = await Message.findByIdAndDelete(id)
        res.status(200).json({message:"Message deleted successfully",message})
    } catch (error){
        res.status(500).json({message:"Internal Server Error",error:error.message})
    }
}



module.exports = {getMessage}