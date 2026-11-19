const express = require("express");
require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./src/config/db");
const authRouts = require("./src/routes/authRoutes");
const roomRoutes = require("./src/routes/roomRoutes");
const socketAuth = require("./src/middleware/socketsAuth");

const app = express();
const server = http.createServer(app);
const initializeRoomSocket = require("./src/sockets/roomSockets");

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
io.use(socketAuth);

initializeRoomSocket(io);


// app.use(cors());
app.use(express.json());
app.use("/api/auth", authRouts);
app.use("/api/rooms", roomRoutes);

app.get("/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to SYNCly Backend"
    });
});

const PORT = process.env.PORT || 8000;

const startServer = async () => {
    try {
        await connectDB();

        server.listen(PORT, () => {
            console.log(`SYNCly server is running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed: ", error);
        process.exit(1);
    }
};

startServer();