const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { spec } = require('node:test/reporters');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Client origin
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
    }
});

let rooms = {}; // Store game states per room

app.use(cors({
    origin: '*', // Replace with the origin of your front-end
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
}));

// Add a new listener for fetching rooms and creating rooms
io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);

    socket.on('getRooms', () => {
        socket.emit('roomsList', rooms);
    });

    socket.on('createRoom', ({ username, settings }) => {
        const roomCode = `room-${Math.floor(Math.random() * 10000)}`;
        rooms[roomCode] = {
            name: settings.roomName || (username + "'s Room"),
            password: settings.password,
            allowSpectators: settings.allowSpectators,
            players: [],
            spectators: [],
            board: null,
            rematchVotes: 0,
        };

        console.log('room created:', rooms[roomCode].name);
    
        io.to(socket.id).emit('roomCreated', { roomCode });
        io.emit('roomsList', rooms);
    });
    

    socket.on('joinRoom', ({ roomCode, username }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length < 2) {
            console.log('player joined:', username);
            socket.join(roomCode);
            rooms[roomCode].players.push({ id: socket.id, username });
 
            io.to(roomCode).emit('joinedRoom', { room: rooms[roomCode] });
            io.emit('roomsList', rooms);
        }
        else {
            console.log('spectator joined:', username);
            socket.join(roomCode);
            rooms[roomCode].spectators.push({ id: socket.id, username });

            io.to(roomCode).emit('joinedRoom', { room: rooms[roomCode] });
            io.emit('roomsList', rooms);
        }
    });

    socket.on('loadedRoom', ({ roomCode }) => {
        if (rooms[roomCode] && rooms[roomCode].players.length >= 2) {
            // pick a random player to start the game
            const randomPlayer = Math.floor(Math.random() * 2);
            io.to(roomCode).emit('newGame', { turn: rooms[roomCode].players[randomPlayer].id });
        }
    });

    socket.on('updateBoard', ({ roomCode, newBoard }) => {
        const room = rooms[roomCode];
        if (room) {
            room.board = newBoard;
            io.to(roomCode).emit('updateBoard', { newBoard });
        }
    });

    socket.on('gameOver', ({ roomCode, winner }) => {
        io.to(roomCode).emit('gameOver', { winner });
    });

    socket.on('changeTurn', ({ roomCode }) => {
        io.to(roomCode).emit('changeTurn');
    });

    socket.on('redirect', ({ roomCode }) => {
        io.to(roomCode).emit('redirect', { roomCode });
    });

    socket.on('voteRematch', ({ roomCode }) => {
        const room = rooms[roomCode];
        room.rematchVotes += 1;
        io.to(roomCode).emit('updateVotes', { votes: room.rematchVotes });
        if (room.rematchVotes === 2) {
            const randomPlayer = Math.floor(Math.random() * 2);
            io.to(roomCode).emit('newGame', { turn: rooms[roomCode].players[randomPlayer].id });
            room.rematchVotes = 0;
        }
    });

    socket.on('getID', () => {
        io.to(socket.id).emit('getID', { playerID: socket.id });
    });

    socket.on('playerLeft', ({ roomCode }) => {
        console.log('player left:', roomCode);
        const room = rooms[roomCode];
        if (room) {
            room.players = room.players.filter(player => player.id !== socket.id);
            console.log('players:', room.players);
            io.to(roomCode).emit('updateRoom', { room });
        }

        if (room.players.length === 0) {
            delete rooms[roomCode];
            io.emit('roomsList', rooms);
        }
    });

    socket.on('disconnect', () => {
        console.log('user disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            const playerIndex = room.players.findIndex(player => player.id === socket.id);
            if (playerIndex !== -1) {
                room.players.splice(playerIndex, 1);
                io.to(roomCode).emit('updateRoom', { room });
                if (room.players.length === 0) {
                    delete rooms[roomCode];
                    io.emit('roomsList', Object.keys(rooms));
                }
            }
        }
    });
});

server.listen(3000, () => {
    console.log('listening on *:3000');
});
