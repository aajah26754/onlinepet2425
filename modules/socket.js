
const socketHandler = (socket, user) => {
    socket.on('connection', (socket) => {
        console.log('A user connected:', socket.id);
    });

    socket.on('chat message', (msg) => {
        const time = new Date().toLocaleTimeString();
        const messageData = {
            user: socket.request.session.user,
            message: msg,
            time: time
        };
        socket.emit('chat message', messageData);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    })
};

module.exports = {
    socketHandler
};