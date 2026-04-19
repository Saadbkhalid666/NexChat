const User = require('../models/UserSchema')

const registerUser = async (req,res) =>{
    
    try{

        const {name,email,password} = req.body
        
        if (!name || !email || !password){
        res.status(400).json({message:'All fields are required'})
        return
    }

    const newUser = new User({
        username:name,
        email:email,
        password:password
    })
    await newUser.save()
    res.status(201).json({message:'User registered successfully'})
} catch (e){

    res.status(500).json({message:e.message})
}


}