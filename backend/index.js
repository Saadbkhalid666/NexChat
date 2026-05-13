const express = require("express");
const app = express();
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const verifyToken = require("./middleware/verifyTokenMiddeware.js")

// Load env FIRST
dotenv.config();

// DB
const connectDB = require("./db/db.js");

// Models
const Message = require("./models/MessageSchema.js");

// Routes
const userRoutes = require("./routes/userRoutes.js");
const messageRoutes = require("./routes/messageRoutes.js");
const adminRoutes = require("./routes/dashboardRoutes.js");
const User = require("./models/UserSchema.js");

connectDB();

app.use(express.json());
app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});


app.get("/api/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

global.onlineUsers = new Set();

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  const userId = socket.handshake.query.userId;

  if (userId) {
    global.onlineUsers.add(userId);
    io.emit("onlineUsers", Array.from(global.onlineUsers));
  }

  socket.on("join_room", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", async ({ roomId, message, sender, receiver }) => {
    try {
      const newMessage = new Message({
        roomId,
        message,
        sender,
        receiver,
      });

      await newMessage.save();

      io.to(roomId).emit("receiveMessage", newMessage);
    } catch (error) {
      console.log("Message Error:", error.message);
    }
  });

  socket.on("typing", (roomId) => {
    socket.to(roomId).emit("showTyping");
  });

  socket.on("stopTyping", (roomId) => {
    socket.to(roomId).emit("hideTyping");
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);

    if (userId) {
      global.onlineUsers.delete(userId);
      io.emit("onlineUsers", Array.from(global.onlineUsers));
    }
  });
  

});

app.use("/api/user", userRoutes);
app.use("/api/message", messageRoutes);
app.use("/api/dashboard", adminRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON format in request body"
    });
  }
  next();
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});