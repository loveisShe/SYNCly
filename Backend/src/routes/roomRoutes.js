const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");
const { createRoom, joinRoom, getAllRooms, getRoomByCode, getMyRooms, leaveRoom, transferOwnership, deletRoom } = require("../controllers/roomControllers");

router.post("/create-room", protect, createRoom);
router.post("/join-room", protect, joinRoom);
router.get("/get-all-rooms", protect, getAllRooms);
router.get("/get-room-by-code/:roomCode", protect, getRoomByCode);
router.get("/get-my-rooms", protect, getMyRooms);
router.delete("/leave-room/:roomCode", protect, leaveRoom);
router.post("/transfer-ownership/:roomCode" , protect, transferOwnership);
router.delete("/delete-room/:roomCode", protect, deletRoom)

module.exports = router;