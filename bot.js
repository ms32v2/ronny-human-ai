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

let bot;
let manualControl = false;

let lastReplyTime = 0;

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

    // Auto login
    setTimeout(() => {
      bot.chat("/login <cpmp0043>");
    }, 4000);

    randomWalk();

  });

  bot.on("chat", async (username, message) => {

    if (username === bot.username) return;

    // Only respond if Ronny is mentioned
    if (!message.toLowerCase().includes("ronny")) return;

    // Prevent spam replies
    const now = Date.now();
    if (now - lastReplyTime < 5000) return;
    lastReplyTime = now;

    console.log(username + ": " + message);

    const reply = await askAI(username, message);

    if (!reply) return;

    bot.chat(reply);

    io.emit("chat", `${username}: ${message}`);
    io.emit("chat", `Ronny: ${reply}`);

  });

  bot.on("kicked", (reason) => {

    console.log("Ronny was kicked:", reason);

  });

  bot.on("end", () => {

    console.log("Ronny disconnected. Reconnecting in 10 seconds...");

    setTimeout(() => {
      createBot();
    }, 10000);

  });

  bot.on("error", (err) => {

    console.log("Bot error:", err.message);

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
