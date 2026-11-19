const initializeRoomSocket = (io) => {

    // Update live participants
    const updateRoomParticipants = async (roomId) => {
        try {
            const sockets = await io.in(roomId).fetchSockets();

            const participants = sockets.map((socket) => ({
                socketId: socket.id
            }));

            io.to(roomId).emit("room-participants", participants);

        } catch (error) {
            console.error("Error updating participants:", error);
        }
    };


    // Handle client connections
    io.on("connection", (socket) => {

        let roomsToUpdate = [];

        console.log("User connected:", socket.id);

        // JOIN ROOM
        socket.on("join-room", async (roomId) => {
            socket.join(roomId);
            await updateRoomParticipants(roomId);

            console.log(`${socket.id} joined room ${roomId}`);

            socket.to(roomId).emit("user-joined", {
                socketId: socket.id,
                message: "A new user joined the room"
            });
        });

        // LEAVE ROOM
        socket.on("leave-room", async (roomId) => {

            socket.to(roomId).emit("user-left", {
                socketId: socket.id,
                message: "A user left the room"
            });

            socket.leave(roomId);
            await updateRoomParticipants(roomId);

            console.log(`${socket.id} left room ${roomId}`);
        });

        // DISCONNECT

        socket.on("disconnecting" , () => {
            roomsToUpdate = [...socket.rooms].filter(
                roomId => roomId !== socket.id
            );

            roomsToUpdate.forEach((roomId) => {
                socket.to(roomId).emit("user-left", {
                    socketId: socket.id,
                    message: "A user left the room"
                });
            });
        });

        socket.on("disconnect", async() => {
            console.log("User disconnected: ", socket.id);

            for(const roomId of roomsToUpdate) {
                await updateRoomParticipants(roomId);
            }
        })


        //SEND MESSAGE

        socket.on("send-message", (data) => {

            const { roomId, message } = data;

            socket.to(roomId).emit("receive-message", {
                socketId: socket.id,
                message: message,
                sentAt: new Date()
            });

        });

        //TYPING INDICATOR

        socket.on("typing" , (roomId) => {
            socket.to(roomId).emit("user-typing" , {
                socketId: socket.id
            });
        });

        //STOP TYPING

        socket.on("stop-typing" , (roomId) => {
            socket.to(roomId).emit("user-stopped-typing" , {
                socketId: socket.id
            });
        });

    });

};

module.exports = initializeRoomSocket;