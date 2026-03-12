require("dotenv").config();

const mineflayer = require("mineflayer");
const { pathfinder, Movements, goals } = require("mineflayer-pathfinder");
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const { askAI, setRoastMode } = require("./ai");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("panel/public"));

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log("Ronny control panel running on port " + PORT);
});

let manualControl = false;
let bot;

function createBot() {

  bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: "Ronny",
    version: false
  });

  bot.loadPlugin(pathfinder);

  bot.once("spawn", () => {

    console.log("Ronny joined the Minecraft server");

    const mcData = require("minecraft-data")(bot.version);
    const movements = new Movements(bot, mcData);

    bot.pathfinder.setMovements(movements);

    // Auto login after join
    setTimeout(() => {
      bot.chat("/login cpmp0043");
    }, 4000);

    randomWalk();

  });

  bot.on("chat", async (username, message) => {

    if (username === bot.username) return;

    const reply = await askAI(username, message);

    bot.chat(reply);

    io.emit("chat", `${username}: ${message}`);
    io.emit("chat", `Ronny: ${reply}`);

  });

  bot.on("kicked", (reason) => {
    console.log("Bot kicked:", reason);
  });

  bot.on("end", () => {

    console.log("Disconnected. Reconnecting in 10 seconds...");

    setTimeout(() => {
      createBot();
    }, 10000);

  });

  bot.on("error", (err) => {
    console.log("Error:", err);
  });

}

createBot();

function randomWalk() {

  setInterval(() => {

    if (!bot || !bot.entity) return;

    if (manualControl) return;

    const pos = bot.entity.position;

    const x = pos.x + (Math.random() * 10 - 5);
    const z = pos.z + (Math.random() * 10 - 5);

    bot.pathfinder.setGoal(new goals.GoalBlock(x, pos.y, z));

  }, 15000);

}

io.on("connection", socket => {

  socket.on("say", msg => {
    if (bot) bot.chat(msg);
  });

  socket.on("roastMode", state => {
    setRoastMode(state);
  });

  socket.on("manual", state => {
    manualControl = state;
  });

});
