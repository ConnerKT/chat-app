import express from 'express';
import { Server } from "socket.io";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3001;
const ADMIN = "Admin";

//This returns an instance of an HTTP server (app.listen)
const expressServer = app.listen(PORT, () => console.log(`Listening on port ${PORT}`));

// state

const UsersState = {
    users: [],
    setUsers: function(newUsersArray){
        this.users = newUsersArray
    }
}

// Socket.io needs to work with an HTTP server because it operates over WS, a protocol that starts as an HTTP request and then upgrades to a WebSocket connection.

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false : ["http://localhost:5500", "http://127.0.0.1:5500"],
    },
});

io.on('connection', socket => {
    console.log(`User ${socket.id} connected`)

    // Upon connection - only to user 
    socket.emit('message', buildMsg(ADMIN, "Welcome to Chat App!"))

socket.on('enterRoom',({name, room}) => {
    // leave previous room if user is in one
    const prevRoom = getUser(socket.id)?.room

    if (prevRoom){
        socket.leave(prevRoom)
        io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name} has left the room`))
    }
    const user = activateUser(socket.id, name, room)
    if (prevRoom)
        {
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom)
            })
        }

    socket.join(user.room)

    socket.emit('message', buildMsg(ADMIN, `You have joined the room ${user.room}`))

    socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))

    io.to(user.room).emit('userList', {
        users: getUsersInRoom(user.room)
    })
    
    io.emit('roomList', {
        rooms: getAllActiveRooms()
    })
})
// When user disconnects - to all others 
socket.on('disconnect', () => {
    const user = getUser(socket.id);
    userLeavesApp(socket.id)
    if (user)
        {
            
        }
})

    // Listening for a message event 
    socket.on('message', data => {
        console.log(data)
        io.emit('message', `${socket.id.substring(0, 5)}: ${data}`)
    })

    

    // Listen for activity 
    socket.on('activity', (name) => {
        socket.broadcast.emit('activity', name)
    })
})

function buildMsg(name, text){
    return {
        name,
        text,
        time: Date.now()
    }
}
// user functions

function activateUser(id, name, room){
    const user = {id, name, room}
    UsersState.setUsers([...UsersState.users.filter(user => user.id !== id), user])
    return user
}
function userLeavesApp(id){
    UsersState.users.filter(user => user.id !== id)
}
function getUser(id){
    return UsersState.users.find(user => user.id === id)
}

function getUsersInRoom(room){
    return UsersState.users.filter(user => user.room === room)
}

function getAllActiveRooms(){
    return Array.from(new Set(UserState.users.map(user => user.room)))
}




