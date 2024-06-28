const express = require("express");
const app = express();
const ws = require("ws");
const server = new ws.Server({ port: 3001 });


server.on('connection', socket => {
    socket.on('message', message => {
        const b = Buffer.from(message);
        console.log(b.toString());
        socket.send(`${message}`)
    })
})

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.listen(3002, () => console.log("Server started on port 3002"));