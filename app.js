const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 4010;

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const db = require('./database');

// API endpoint to create a chat room
app.post('/chatrooms', (req, res) => {
    const { name } = req.body;
    db.createChatRoom(name, (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Error creating chat room', error: err.message });
        } else {
            res.status(201).send({ message: 'Chat room created', chatroomId: result.chatroomId });
        }
    });
});

// API endpoint to join a chat room
app.post('/chatrooms/:roomId/users', (req, res) => {
    const { name } = req.body;
    db.addUser(name, (err, result) => {
        if (err) {
            res.status(500).send({ message: 'Error adding user', error: err.message });
        } else {
            res.status(200).send({ message: 'Joined chat room', userId: result.userId });
        }
    });
});

// API endpoint to send a message to a chat room
app.post('/chatrooms/:roomId/messages', (req, res) => {
    const { roomId } = req.params;
    const { nickname, message } = req.body;
    db.addUser(nickname, (err, userResult) => {
        if (err) {
            res.status(500).send({ message: 'Error adding user', error: err.message });
        } else {
            db.sendMessage(roomId, userResult.userId, message, (err) => {
                if (err) {
                    res.status(500).send({ message: 'Error sending message', error: err.message });
                } else {
                    res.status(201).send({ message: 'Message sent' });
                }
            });
        }
    });
});

// API endpoint to check for new messages since a certain timestamp
app.get('/chatrooms/:roomId/messages', (req, res) => {
    const { roomId } = req.params;
    const { timestamp } = req.query;
    db.getMessagesSince(roomId, timestamp, (err, messages) => {
        if (err) {
            res.status(500).send({ message: 'Error retrieving messages', error: err.message });
        } else {
            res.status(200).send({ messages });
        }
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
