const express = require("express");
require("dotenv").config();

const connectDB = require("./src/config/db");
const authRouts = require("./src/routes/authRoutes");
const roomRoutes = require("./src/routes/roomRoutes");

const app = express();

// app.use(cors());
app.use(express.json());
app.use("/api/auth" , authRouts);
app.use("/api/rooms" , roomRoutes);

app.get("/health" , (req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to SYNCly Backend"
    });
});

const PORT = process.env.PORT || 8000;

const startServer = async() => {
    try{
        await connectDB();

        app.listen(PORT , () => {
            console.log(`SYNCly server is running at http://localhost:${PORT}`);
        });
    }catch(error){
        console.error("Server startup failed: " , error);
        process.exit(1);
    }
};

startServer();