const sqlite3 = require('sqlite3').verbose();

// Connect to SQLite database
const db = new sqlite3.Database('./chatroom.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the chatroom SQLite database.');
});

// Create tables if they do not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS chatrooms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chatroom_id TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        message TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chatroom_id) REFERENCES chatrooms (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);
});

// Export functions to interact with the database
module.exports = {
    createChatRoom: function(id, name, callback) {
        const sql = `INSERT INTO chatrooms (id, name) VALUES (?, ?)`;
        db.run(sql, [id, name], function(err) {
            callback(err, { chatroomId: this.lastID });
        });
    },
    addUser: function(name, callback) {
        const sql = `INSERT INTO users (name) VALUES (?)`;
        db.run(sql, [name], function(err) {
            callback(err, { userId: this.lastID });
        });
    },
    sendMessage: function(chatroomId, userId, message, callback) {
        const sql = `INSERT INTO messages (chatroom_id, user_id, message) VALUES (?, ?, ?)`;
        db.run(sql, [chatroomId, userId, message], function(err) {
            callback(err);
        });
    },
    getMessagesSince: function(chatroomId, timestamp, callback) {
        const sql = `SELECT users.name as nickname, messages.timestamp, messages.message
                     FROM messages
                     JOIN users ON messages.user_id = users.id
                     WHERE messages.chatroom_id = ? AND messages.timestamp > ?
                     ORDER BY messages.timestamp ASC`;
        db.all(sql, [chatroomId, new Date(timestamp).toISOString()], function(err, rows) {
            callback(err, rows);
        });
    }
};

// Close the database connection when the application is terminated
process.on('SIGINT', () => {
    db.close(() => {
        console.log('Database connection closed.');
        process.exit(0);
    });
});
