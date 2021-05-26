var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

const app = express();
const http = require("http");
const socketIO = require("socket.io");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "node_modules")));

const server = http.Server(app).listen(8080);
const io = socketIO(server);
const clients = {};

const userJoin = (socket) => {
  console.log("New client connected", socket.id);
  clients[socket.id] = socket;
};

const userLeave = (socket) => {
  console.log("Client disconnected", socket.id);
  delete clients[socket.id];
};

io.sockets.on("connection", (socket) => {
  let id = socket.id;
  userJoin(socket);

  setTimeout(() => {
    socket.emit(
      "initial",
      Object.keys(clients)
        .filter((key) => clients[key].data.id)
        .map((key) => clients[key].data)
    );
  });

  socket.on("mousemove", (data) => {
    data.id = id;
    clients[socket.id].data = data;
    socket.broadcast.emit("moving", data);
  });

  socket.on("disconnect", () => {
    userLeave(socket);
    socket.broadcast.emit("clientdisconnect", id);
  });
});
