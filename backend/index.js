const express = require("express");
const app = express();
const dotenv = require("dotenv");

const connectDB = require("./db/db.js");
//routes
const userRoutes = require("./routes/userRoutes.js");
const messageRoutes = require('./routes/messageRoutes.js')

app.use(express.json());
connectDB();

app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);

dotenv.config();

// Global Error Handler to catch malformed JSON and other errors
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ message: "Invalid JSON format in request body" });
  }
  next();
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
