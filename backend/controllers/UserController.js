const User = require("../models/UserSchema.js");
const jwt = require("jsonwebtoken")

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      }); 
    }
    if(password.length < 8){
      return res.status(400).json({
        message: "Password must be at least 8 characters long"
      });
    }
    if(username.length < 3){
      return res.status(400).json({
        message: "Username must be at least 3 characters long"
      });
    }
    if(email.length < 3){
      return res.status(400).json({
        message: "Email must be at least 3 characters long"
      });
    }
    const existingUser = await User.findOne({ email });
    if(existingUser){
      return res.status(400).json({
        message: "User already exists"
      });
    }

    const newUser = new User({
      username: username,
      email,
      password
    });

    await newUser.save();
    
    const token  =  jwt.sign({
      id:newUser._id,
      username:newUser.username,
      role:newUser.role
    },process.env.JWT_SECRET,{
      expiresIn:"30d"
    })



    res.status(201).json({
      message: "User registered successfully",
      token,
      user:{
        id:newUser._id,
        username:newUser.username,
        role:newUser.role
      }
    });

  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
};

const getUser = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json(user);

  } catch (e) {
    res.status(500).json({
      message: e.message
    });
  }
};



const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isMatch = await require("bcrypt").compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const jwt = require("jsonwebtoken");

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};









module.exports = { registerUser, getUser, loginUser };