require('dotenv').config();
const path = require('path')
const express = require('express');
const mysql = require('mysql2');
const http = require('http')
const WebSocket = require("ws");
const bodyParser = require('body-parser');
const cors = require('cors')
const app = express();
app.use(express.json())

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({
//     extended: true
// }))

console.log(process.env.IP_ADDRESS);



const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
})

db.connect((err) => {
    if (err) {
        console.log('Database connection failed !!!')
    } else {
        console.log('Connected to database');

    }
})
/*
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });
*/

const profilRoutes = require('./routes/profiles');
const userRoutes = require('./routes/users');
const personalizationsRoutes = require('./routes/personalizations');
const likesRoutes = require('./routes/likes');
const channelsRoutes = require('./routes/channels');
const matchsRoutes = require('./routes/matchs');
const messagesRoutes = require('./routes/messages');

app.use('/api/users', userRoutes)
app.use('/api/profiles', profilRoutes)
app.use('/api/personalizations', personalizationsRoutes)
app.use('/api/likes', likesRoutes)
app.use('/api/channels', channelsRoutes)
app.use('/api/matchs', matchsRoutes)
app.use('/api/messages', messagesRoutes)


// const port = process.env.PORT || 3000;
// app.listen(port, '0.0.0.0' ,() => {
//     console.log('SERVEUR DEMARRE')
// })

const server = http.createServer(app);
const websocketServer = new WebSocket.Server({ server });

//Listen for WebSocket connections
websocketServer.on('connection', (socket) => {
    // Log a message when a new client connects
    console.log('client connected.');
    // Listen for incoming WebSocket messages
    socket.on('message', (data) => {

        // Broadcast the message to all connected clients
        websocketServer.clients.forEach(function each(client) {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(data.toString());
                // console.log("message",data.toString())
            }
        });
    });

       // Écoute l'événement "typing"
       socket.on('typing', (data) => {
           console.log(data);
        // Broadcast le statut de saisie à tous les clients sauf celui qui a envoyé
        websocketServer.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ typing: true, user: data.user }));
            }
        });
    });

    // Écoute l'événement "stop typing"
    socket.on('stop typing', (data) => {
        
        websocketServer.clients.forEach((client) => {
            if (client !== socket && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify({ typing: false, user: data.user }));
            }
        });
    });







    // Listen for WebSocket connection close events
    socket.on('close', () => {
        // Log a message when a client disconnects
        console.log('Client disconnected');
    });

    socket.onerror = (error) => {
        console.error('WebSocket erreur:', error);
    };




});



const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log('SERVEUR DEMARRE')
})