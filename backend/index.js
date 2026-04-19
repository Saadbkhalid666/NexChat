const express = require("express");
const app = express();
const dotenv = require("dotenv");

const connectDB = require("./db/db.js");

const userRoutes = require("./routes/userRoutes.js");

app.use(express.json());
connectDB();

app.use("/api/user", userRoutes);

dotenv.config();

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
