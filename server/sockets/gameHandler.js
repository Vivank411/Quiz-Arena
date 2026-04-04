const Question = require('../models/Question');

// In-Memory Game State
// { roomCode: { players: [{id, name, score}], questions: [], currentQIndex: 0, status: 'lobby'|'playing'|'ended', timerInterval: null } }
const rooms = {};
const Q_TIME_LIMIT = 15; // 15 seconds per question

function initGameSockets(io) {
    io.on('connection', (socket) => {
        console.log(`🔌 Player connected: ${socket.id}`);

        socket.on('create_room', async ({ playerName }) => {
            const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
            
            rooms[roomCode] = {
                players: [{ id: socket.id, name: playerName, score: 0 }],
                questions: [],
                currentQIndex: 0,
                status: 'lobby',
                timerInterval: null
            };

            socket.join(roomCode);
            socket.emit('room_created', { roomCode, isHost: true });
            io.to(roomCode).emit('lobby_update', rooms[roomCode].players);
        });

        socket.on('join_room', ({ roomCode, playerName }) => {
            const room = rooms[roomCode];
            if (!room) {
                return socket.emit('error_msg', 'Room does not exist.');
            }
            if (room.status !== 'lobby') {
                return socket.emit('error_msg', 'Game already started.');
            }

            room.players.push({ id: socket.id, name: playerName, score: 0 });
            socket.join(roomCode);
            socket.emit('room_joined', { roomCode });
            io.to(roomCode).emit('lobby_update', room.players);
        });

        socket.on('start_game', async ({ roomCode }) => {
            const room = rooms[roomCode];
            if (room) {
                room.status = 'playing';
                room.questions = await Question.getRandomQuestions(5); // 5 Qs per match
                room.currentQIndex = -1;
                io.to(roomCode).emit('game_started');
                nextQuestion(io, roomCode);
            }
        });

        socket.on('submit_answer', ({ roomCode, answer, timeRemaining }) => {
            const room = rooms[roomCode];
            if (!room) return;

            const q = room.questions[room.currentQIndex];
            const player = room.players.find(p => p.id === socket.id);

            // Give points if correct, based on time remaining to incentivize speed
            if (q.correct_option === answer) {
                // Score formula: Base 100 + Time Bonus (max 150)
                const points = 100 + (timeRemaining * 10);
                if (player) player.score += points;
            } else {
                // Penalize purely random clicking? Not implemented here for simplicity
            }

            // Sync score immediately
            io.to(roomCode).emit('leaderboard_update', room.players.sort((a,b) => b.score - a.score));
        });

        socket.on('disconnect', () => {
            // Remove player from any room they are in
            for (const roomCode in rooms) {
                const room = rooms[roomCode];
                room.players = room.players.filter(p => p.id !== socket.id);
                if (room.players.length === 0) {
                    if (room.timerInterval) clearInterval(room.timerInterval);
                    delete rooms[roomCode];
                } else {
                    io.to(roomCode).emit('lobby_update', room.players);
                }
            }
        });
    });
}

function nextQuestion(io, roomCode) {
    const room = rooms[roomCode];
    if (!room) return;

    room.currentQIndex++;
    if (room.currentQIndex >= room.questions.length) {
        // Game Over
        room.status = 'ended';
        io.to(roomCode).emit('game_over', room.players.sort((a,b) => b.score - a.score));
        return;
    }

    const q = room.questions[room.currentQIndex];
    // Strip correct answer so clients can't cheat by looking at network payload
    const qPayload = {
        question_text: q.question_text,
        option_a: q.option_a,
        option_b: q.option_b,
        option_c: q.option_c,
        option_d: q.option_d,
        questionIndex: room.currentQIndex + 1,
        totalQuestions: room.questions.length
    };

    io.to(roomCode).emit('new_question', qPayload);

    // Timer Logic
    let timeLeft = Q_TIME_LIMIT;
    if (room.timerInterval) clearInterval(room.timerInterval);

    room.timerInterval = setInterval(() => {
        io.to(roomCode).emit('timer_tick', timeLeft);
        timeLeft--;

        if (timeLeft < 0) {
            clearInterval(room.timerInterval);
            // Time up! Send correct answer and start next question after delay
            io.to(roomCode).emit('question_result', q.correct_option);
            setTimeout(() => nextQuestion(io, roomCode), 3000);
        }
    }, 1000);
}

module.exports = { initGameSockets };
