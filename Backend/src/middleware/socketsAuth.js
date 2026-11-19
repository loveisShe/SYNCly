const jwt = require("jsonwebtoken");
const User = require("../models/Users");

const socketAuth = async (socket , next) => {
    try{

        console.log("Socket auth middleware called");

        const token = socket.handshake.auth.token;
        
        console.log("Token received:", !!token);

        if(!token){
            return next(new Error("Authentication token error"));
        }

        const decoded = jwt.verify(token , process.env.JWT_SECRET);

        const user = await User.findById(decoded.userId).select("-password");

        if(!user){
            return next(new Error("User not found"));
        }

        socket.userId = user._id.toString();
        socket.user = user;

        next();
    }catch(error){
        return next (new Error("Invalid or Expired Token"));
    }
};

module.exports = socketAuth;