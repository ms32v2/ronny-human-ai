const socket = io();

let roast = false;
let manual = false;

function send(){

const msg = document.getElementById("msg").value;

socket.emit("say", msg);

}

function toggleRoast(){

roast = !roast;

socket.emit("roastMode", roast);

}

function toggleManual(){

manual = !manual;

socket.emit("manual", manual);

}

socket.on("chat", msg => {

const div = document.getElementById("chat");

div.innerHTML += `<div>${msg}</div>`;

});
