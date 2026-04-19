const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Mongodb Connected Successfully!");
  } catch (e) {
    console.log(e.message);
  }
};

module.exports = connectDB