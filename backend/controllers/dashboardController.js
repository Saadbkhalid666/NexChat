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

const updateUser = async (req,res) => {
    try{
        const id = req.params
        const user = await User.findByIdAndUpdate(id,req.body)
        res.status(200).json({message:"User updated successfully",user})
    } catch (error){
        res.status(500).json({message:"Internal Server Error",error:error.message})
    }
}

const deleteUser = async (req,res) => {
    try{
        const id = req.params
        const user = await User.findByIdAndDelete(id)
        res.status(200).json({message:"User deleted successfully",user})
    } catch (error){
        res.status(500).json({message:"Internal Server Error",error:error.message})
    }
}

const getUsers = async (req,res) => {
    try{

        const users = User.find()
        res.status(200).json({message:"User Fetched Successfully!", usrers})
    }catch (error){
        res.status(500).json({message:"Internal Server Error!", error: error.message})
    }
}

module.exports = {getMessage,deleteMessage,updateUser,deleteUser,getUsers}