const express = require("express");
const socketio = require("socket.io");
const http = require("http");

const { addUser, removeUser, getUser, getUsersInRoom } = require("./users");

const router = require("./routers");

const PORT = process.env.PORT || 5000;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

io.on("connection", (socket) => {
  socket.on("join", ({ name, room }, callback) => {
    const { error, user } = addUser({ id: socket.id, name, room });
    if (error) return callback({ error });
    socket.join(user.room);

    socket.emit("message", {
      user: "admin",
      text: `${user.name}, welcome to the room ${user.room}`,
    }); // telling the user that he welcome to the chat
    socket.broadcast
      .to(user.room)
      .emit("message", { user: "admin", text: `${user.name},has joined!` }); // letting everybody else beside that user know that that user has joined
    io.to(user.room).emit("roomData", { // check how many user in the room
      room: user.room,
      users: getUsersInRoom(user.room),
    });
    callback();
  });
  socket.on("sendMessage", (message, callback) => {
    // get the id of the user have access to this socket from up about right here
    // That is a specific user
    const user = getUser(socket.id);
    io.to(user.room).emit("message", { user: user.name, text: message }); // message come from the fontend
    callback(); // do something after the message is sent on the fontend
  });
  socket.on("disconnect", () => {
    const user = removeUser(socket.id);

    if (user) {
      io.to(user.room).emit("message", {
        user: "Admin",
        text: `${user.name} has left.`,
      });
      io.to(user.room).emit("roomData", { // check how many user in the room
        room: user.room,
        users: getUsersInRoom(user.room),
      });
    }
  });
});

app.use(router);

server.listen(PORT, () =>
  console.log(`server has started on port ${PORT} ....`)
);
