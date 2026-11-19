const Room = require("../models/Rooms");
const crypto = require("crypto");

const generateRoomCode = () => {
    return "SYNC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
};

const generateUniqueRoomCode = async () => {
    let roomCode;
    let roomExists = true;

    while (roomExists) {
        roomCode = generateRoomCode();

        const existingRoom = await Room.findOne({ roomCode });

        if (!existingRoom) {
            roomExists = false;
        }
    }
    return roomCode;
}

const createRoom = async (req, res) => {
    try {
        const { roomName, subject, isPrivate, maxParticipants } = req.body;

        if (!roomName || !subject) {
            return res.status(400).json({
                success: false,
                message: "Room name and subject are required"
            });
        }

        const roomCode = await generateUniqueRoomCode();

        const newRoom = await Room.create({
            roomName,
            subject,
            roomCode,
            createdBy: req.user._id,
            participants: [req.user._id],
            isPrivate: isPrivate ?? false,
            maxParticipants: maxParticipants ?? 6
        });

        return res.status(201).json({
            success: true,
            message: "Room created successfully",
            room: newRoom
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create study Room",
            error: error.message
        });
    }
};

const joinRoom = async (req, res) => {
    try {
        const { roomCode } = req.body;

        if (!roomCode) {
            return res.status(400).json({
                success: false,
                message: "Room code is required"
            });
        }

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        const isAlreadyExists = room.participants.some(
            (participantId) => participantId.toString() === req.user._id.toString()
        )

        if (isAlreadyExists) {
            return res.status(400).json({
                success: false,
                message: "You are already a member of this room"
            });
        }

        if (room.participants.length >= room.maxParticipants) {
            return res.status(409).json({
                success: false,
                message: "Room is full"
            });
        }

        room.participants.push(req.user._id);
        await room.save();

        return res.status(200).json({
            success: true,
            message: "Joined room sucessfully",
            room
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to join room",
            error: error.message
        });
    }
};


const getAllRooms = async (req, res) => {
    try {
        const rooms = await Room.find({
            isPrivate: false
        }).populate("createdBy", "name").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch rooms",
            error: error.message
        });
    }
};

const getRoomByCode = async (req, res) => {
    try {
        const { roomCode } = req.params;

        if (!roomCode) {
            return res.status(400).json({
                success: false,
                message: "Rome code is required"
            });
        }

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        }).populate("createdBy", "name").populate("createdBy", "email");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        return res.status(200).json({
            success: true,
            room
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch room details",
            error: error.message
        });
    }
};

const getMyRooms = async (req, res) => {
    try {
        const userId = req.user._id;

        const rooms = await Room.find({
            participants: userId
        }).populate("createdBy", "name").sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            count: rooms.length,
            rooms
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your room",
            error: error.message
        });
    }
};

const leaveRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const userId = req.user._id;

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                messgae: "Room not found"
            });
        }

        if (room.createdBy.toString() === userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Creator must transfer ownership or delete the room"
            });
        }

        const isMember = room.participants.some(
            (participantId) => participantId.toString() === userId.toString()
        );

        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "You are not a member of this room"
            });
        }

        room.participants = room.participants.filter(
            (participantId) => participantId.toString() !== userId.toString()
        )

        await room.save();

        return res.status(200).json({
            success: true,
            message: "You have left the room successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to leave the room",
            error: error.message
        });
    }
};

const transferOwnership = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const { newOwnerId } = req.body;
        const currentUserId = req.user._id;

        if (!newOwnerId) {
            return res.status(400).json({
                success: false,
                message: "New owner ID is required"
            });
        }

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        if (room.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only creater can transfer the ownership"
            });
        }

        const isMember = room.participants.some(
            (participantId) => participantId.toString() === newOwnerId.toString()
        );

        if (!isMember) {
            return res.status(400).json({
                success: false,
                message: "New owner must bhi a room participant"
            });
        }

        room.createdBy = newOwnerId;

        await room.save();

        return res.status(200).json({
            success: true,
            message: "Room ownership transferred successfully",
            room
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to Transfer Ownership",
            error: error.message
        });
    }
};

const deletRoom = async (req, res) => {
    try {
        const { roomCode } = req.params;
        const currentUserId = req.user._id;

        const room = await Room.findOne({
            roomCode: roomCode.trim().toUpperCase()
        });

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Room not found"
            });
        }

        if (room.createdBy.toString() !== currentUserId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only creator can delete this room"
            });
        }

        await room.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Room deleted Successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to delete the room",
            error: error.message
        });
    }
};

module.exports = {
    createRoom,
    joinRoom,
    getAllRooms,
    getRoomByCode,
    getMyRooms,
    leaveRoom,
    transferOwnership,
    deletRoom
};


