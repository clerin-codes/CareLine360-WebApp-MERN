const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const chatService = require("./services/chatService");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*" },
});

// Middleware
app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Routes
const userRoutes = require("./routes/userRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const chatRoutes = require("./routes/chatRoutes");

app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/chat", chatRoutes);

// Error Handler (must be after routes)
app.use(errorHandler);

const { startReminderScheduler } = require("./services/reminderScheduler");

io.on("connection", (socket) => {
  socket.on("joinRoom", (appointmentId) => {
    socket.join(appointmentId);
  });

  socket.on("sendMessage", async (data) => {
    try {
      const message = await chatService.sendMessage(data);
      io.to(data.appointment).emit("newMessage", message);
    } catch (err) {
      socket.emit("error", { message: "Failed to send message" });
    }
  });
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startReminderScheduler();
});
