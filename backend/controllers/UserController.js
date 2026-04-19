const User = require("../models/UserSchema.js");

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        message: "All fields are required"
      }); 
    }

    const newUser = new User({
      username: username,
      email,
      password
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully"
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

module.exports = { registerUser, getUser };