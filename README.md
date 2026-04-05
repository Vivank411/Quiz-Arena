# Multiplayer Quiz Arena 🚀

Deployed Link: https://quiz-arena-game.onrender.com/

An intermediate-to-advanced level full-stack web application showcasing real-time synchronization, fluid requestAnimationFrame physics, and deep Socket.IO room management. 

## 🌟 Features
- **Mode**: Answer options detach from standard UI flow and bounce around the container using a highly optimized, GPU-accelerated Vanilla JS physics engine.
- **Speed Scoring**: Points are heavily weighted based on remaining time when an answer is clicked.
- **Robust Real-time Backend**: Manages multiple concurrent rooms without state collision, including connection drops and garbage collections of lingering empty rooms.
- **MySQL Interfacing**: Hooks securely into a MySQL database via connection-pooling, while utilizing smart fallbacks to in-memory questions allowing it to boot instantly even without MySQL.
- **Audio Effects**: Built-in sound effects using Web Audio API for timer ticks and answers.

## 🛠 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3, JavaScript (No frameworks!)
- **Backend**: Node.js, Express.js
- **Realtime**: Socket.IO
- **Database**: MySQL (`mysql2` library)

## 📁 Architecture
- `/client`: Static front-end assets including the physics engine (`antigravity.js`), socket event handler (`app.js`), and Glassmorphic CSS (`styles.css`).
- `/server/index.js`: The Express & Server initiator.
- `/server/sockets/gameHandler.js`: Contains complex room state objects and time-sensitive broadcast loops.
- `/server/config/db.js`: MySQL pool initialization and fallback error handling.
- `/server/models/Question.js`: Data fetching (Database OR Fallback array).

## 🚀 Setup & Run Instructions

**1. Install Dependencies**
```bash
npm install
```

**2. Database Setup (Optional but Recommended)**
- Install and start a MySQL server.
- Run the SQL commands in `schema.sql` to generate the test database and table.
- Modify `.env` with your DB credentials if they differ from the defaults.
*(Note: If the DB fails to connect, the application gracefully degrades by loading in-memory questions instead of crashing, ensuring instant demo capability!)*

**3. Run the Server**
```bash
npm start
```
Go to `http://localhost:3000` in multiple browser windows to test the real-time networking!

## 📈 Scalability Strategies (Production ready considerations)
- **Redis Adapters**: Currently `rooms` is held in server memory. To scale to a multi-node Kubernetes cluster, use `@socket.io/redis-adapter` so room state is shared across processes.
- **Timer Outsourcing**: Move `setInterval` out of Node's main event loop for high concurrency, or use epoch-timestamp diffing rather than strict interval ticking. 
- **DB Indexing**: The `ORDER BY RAND()` query is acceptable for a small catalog of questions. For millions of rows, random offset mappings should be pre-calculated.
