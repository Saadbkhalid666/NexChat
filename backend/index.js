const express = require("express");
const app = express();
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");

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

connectDB();

app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
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

  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("sendMessage", async ({ roomID, message, sender, receiver }) => {
    try {
      const newMessage = new Message({
        roomID,
        message,
        sender,
        receiver
      });

      await newMessage.save();

      io.to(roomID).emit("receiveMessage", newMessage);
    } catch (error) {
      console.log("Message Error:", error.message);
    }
  });

  socket.on("typing", (roomID) => {
    socket.to(roomID).emit("showTyping");
  });

  socket.on("stopTyping", (roomID) => {
    socket.to(roomID).emit("hideTyping");
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
app.use("/api/admin", adminRoutes);

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({
      message: "Invalid JSON format in request body"
    });
  }
  next();
});

server.listen(process.env.PORT, "192.168.1.8", () => {
  console.log(`Server running on port ${process.env.PORT}`);
});