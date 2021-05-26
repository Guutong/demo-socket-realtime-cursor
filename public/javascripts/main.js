window.onload = function () {
  const url = window.location.origin;
  let socket = io.connect(url);
  let clients = {};
  let pointers = {};

  let canvas = document.getElementById("canvas");
  let context = canvas.getContext("2d");
  let pointerContainer = document.getElementById("pointers");
  let pointer = document.createElement("div");
  pointer.classList.add("pointer");

  function drawLine(fromx, fromy, tox, toy) {
    context.moveTo(fromx, fromy);
    context.lineTo(tox, toy);
    context.stroke();
  }

  canvas.addEventListener("mousemove", function (e) {
    const cRect = canvas.getBoundingClientRect();
    const canvasX = Math.round(e.clientX - cRect.left);
    const canvasY = Math.round(e.clientY - cRect.top);
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText("X: " + canvasX + ", Y: " + canvasY, 10, 20);
    socket.emit("mousemove", {
      x: canvasX,
      y: canvasY
    });
  });

  socket.on("initial", function (datas) {
    console.log(datas);
    datas.forEach((data) => {
      if (!clients.hasOwnProperty(data.id)) {
        pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
      }

      pointers[data.id].innerText = data.id;
      pointers[data.id].style.left = data.x + "px";
      pointers[data.id].style.top = data.y + "px";

      if (data.drawing && clients[data.id]) {
        drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
      }

      clients[data.id] = data;
    });
  });

  socket.on("moving", function (data) {
    if (!clients.hasOwnProperty(data.id)) {
      pointers[data.id] = pointerContainer.appendChild(pointer.cloneNode());
    }

    pointers[data.id].innerText = data.id;
    pointers[data.id].style.left = data.x + "px";
    pointers[data.id].style.top = data.y + "px";

    if (data.drawing && clients[data.id]) {
      drawLine(clients[data.id].x, clients[data.id].y, data.x, data.y);
    }

    clients[data.id] = data;
  });

  socket.on("clientdisconnect", function (id) {
    delete clients[id];
    if (pointers[id]) {
      pointers[id].parentNode.removeChild(pointers[id]);
    }
  });
};
