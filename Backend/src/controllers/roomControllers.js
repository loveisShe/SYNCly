const Room = require("../models/Rooms");
const crypto = require("crypto");

const generateRoomCode = () => {
    return "SYNC-" + crypto.randomBytes(3).toString("hex").toUpperCase();
};

const generateUniqueRoomCode = async() => {
    let roomCode;
    let roomExists = true;

    while(roomExists){
        roomCode = generateRoomCode();

        const existingRoom = await Room.findOne({ roomCode });

        if(!existingRoom){
            roomExists = false;
        }
    }
    return roomCode;
}

const createRoom = async(req, res) => {
    try{
        const { roomName , subject , isPrivate , maxParticipants } = req.body;

        if(!roomName || !subject){
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
    }catch(error){
        return res.status(500).json({
            success: false,
            message: "Failed to create study Room",
            error: error.message
        });
    }
};

module.exports = createRoom;


