const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema(
    {
        roomName: {
            type: String,
            required: true,
            trim: true
        },
        subject: {
            type: String,
            required: true,
            trim: true
        },
        roomCode: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User"
            }
        ],
        isPrivate: {
            type: Boolean,
            default: false
        },
        maxParticipants: {
            type: Number,
            default: 6
        },
        status: {
            type: String,
            enum: ["active" , "completed"],
            default: "active"
        }
    },
    {
        timestamps: true
    }
)

const Room = mongoose.model("Room" , roomSchema);

module.exports = Room ;