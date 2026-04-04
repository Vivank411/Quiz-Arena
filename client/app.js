// Connect to Server via WebSocket
const socket = io();

// State
let myName = '';
let currentRoom = '';
let isHost = false;
let hasAnswered = false;
let currentTimeRemaining = 15;

// Physics Engine Instance
const physicsEngine = new window.AntiGravityEngine('antigravity-arena');

// Audio Context removed per request

// ------ UI Navigation ------
function showView(viewId) {
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');
}

// ------ Event Listeners ------
document.getElementById('btnCreate').addEventListener('click', () => {
    myName = document.getElementById('playerName').value.trim();
    if(!myName) return alert("Please enter your name!");
    socket.emit('create_room', { playerName: myName });
});

document.getElementById('btnJoin').addEventListener('click', () => {
    myName = document.getElementById('playerName').value.trim();
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if(!myName || !code) return alert("Name and Room Code required!");
    socket.emit('join_room', { roomCode: code, playerName: myName });
});

document.getElementById('btnStart').addEventListener('click', () => {
    if(isHost) {
        socket.emit('start_game', { roomCode: currentRoom });
    }
});

// ------ Socket Responses ------

socket.on('error_msg', (msg) => {
    document.getElementById('joinError').innerText = msg;
});

socket.on('room_created', ({ roomCode }) => {
    currentRoom = roomCode;
    isHost = true;
    document.getElementById('displayRoomCode').innerText = roomCode;
    document.getElementById('hostControls').classList.remove('hidden');
    document.getElementById('waitingMsg').classList.add('hidden');
    showView('view-lobby');
});

socket.on('room_joined', ({ roomCode }) => {
    currentRoom = roomCode;
    isHost = false;
    document.getElementById('displayRoomCode').innerText = roomCode;
    document.getElementById('hostControls').classList.add('hidden');
    showView('view-lobby');
});

socket.on('lobby_update', (players) => {
    const list = document.getElementById('playerList');
    list.innerHTML = '';
    players.forEach(p => {
        list.innerHTML += `<li>${p.name} ${p.id === socket.id ? '(You)' : ''}</li>`;
    });
});

socket.on('game_started', () => {
    showView('view-game');
    document.getElementById('antigravity-arena').classList.remove('hidden');
});

socket.on('new_question', (qPayload) => {
    hasAnswered = false;
    physicsEngine.clear();
    
    document.getElementById('questionText').innerText = qPayload.question_text;
    document.getElementById('questionProgress').innerText = `Question ${qPayload.questionIndex} / ${qPayload.totalQuestions}`;
    document.getElementById('timeRemaining').innerText = "15";
    
    // Create floating buttons
    const options = [
        { key: 'A', text: qPayload.option_a },
        { key: 'B', text: qPayload.option_b },
        { key: 'C', text: qPayload.option_c },
        { key: 'D', text: qPayload.option_d }
    ];

    options.forEach(opt => {
        const btn = document.createElement('div');
        btn.className = 'floating-answer';
        btn.innerText = `${opt.key}: ${opt.text}`;
        btn.dataset.key = opt.key;
        
        btn.addEventListener('click', () => submitAnswer(opt.key, btn));
        physicsEngine.addObject(btn);
    });

    physicsEngine.start();
});

function submitAnswer(key, btnElement) {
    if (hasAnswered) return;
    hasAnswered = true;
    
    // Freeze physics engine so they visually lock in their choice immediately!
    physicsEngine.freeze();
    
    // Visual feedback
    btnElement.style.border = "4px solid white";
    btnElement.style.transform +=(" scale(1.1)");

    socket.emit('submit_answer', {
        roomCode: currentRoom,
        answer: key,
        timeRemaining: currentTimeRemaining
    });
}

socket.on('timer_tick', (timeLeft) => {
    currentTimeRemaining = timeLeft;
    document.getElementById('timeRemaining').innerText = timeLeft;
});

socket.on('question_result', (correctOption) => {
    physicsEngine.freeze(); // Stop bouncing to reveal answers
    
    const buttons = document.querySelectorAll('.floating-answer');
    buttons.forEach(btn => {
        if(btn.dataset.key === correctOption) {
            btn.classList.add('correct');
        } else {
            btn.classList.add('wrong');
        }
    });

});

socket.on('leaderboard_update', (sortedPlayers) => {
    renderLeaderboard(sortedPlayers, 'gameLeaderboard');
});

socket.on('game_over', (finalScores) => {
    physicsEngine.clear();
    showView('view-over');
    renderLeaderboard(finalScores, 'finalScores');
});

function renderLeaderboard(players, elementId) {
    const list = document.getElementById(elementId);
    list.innerHTML = '';
    players.forEach((p, index) => {
        list.innerHTML += `<li><span>${index+1}. ${p.name}</span> <span>${p.score} pts</span></li>`;
    });
}
