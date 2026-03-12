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
let lastReply = 0;

function createBot() {

  bot = mineflayer.createBot({
    host: process.env.MC_HOST,
    port: parseInt(process.env.MC_PORT),
    username: "Ronny",
    version: false
  });

  bot.loadPlugin(pathfinder);

  bot.once("spawn", () => {

    console.log("Ronny joined the server");

    const mcData = require("minecraft-data")(bot.version);
    const movements = new Movements(bot, mcData);

    bot.pathfinder.setMovements(movements);

    // Auto login
    setTimeout(() => {
      bot.chat("/login <cpmp0043>");
    }, 4000);

    startHumanBehaviour();

  });

  bot.on("chat", async (username, message) => {

    if (username === bot.username) return;

    console.log(username + ": " + message);

    // look at speaking player
    const player = bot.players[username];
    if (player && player.entity) {
      bot.lookAt(player.entity.position.offset(0, 1.6, 0));
    }

    // prevent spam replies
    const now = Date.now();
    if (now - lastReply < 4000) return;

    lastReply = now;

    const reply = await askAI(username, message);

    if (!reply) return;

    // human typing delay
    const delay = Math.min(4000, reply.length * 55);

    setTimeout(() => {
      bot.chat(reply);
    }, delay);

    io.emit("chat", `${username}: ${message}`);
    io.emit("chat", `Ronny: ${reply}`);

  });

  bot.on("end", () => {

    console.log("Disconnected. Reconnecting in 10 seconds...");

    setTimeout(() => {
      createBot();
    }, 10000);

  });

  bot.on("kicked", reason => {
    console.log("Bot kicked:", reason);
  });

  bot.on("error", err => {
    console.log("Bot error:", err.message);
  });

}

createBot();

function startHumanBehaviour() {

  randomWalk();
  idleActions();
  randomTalking();

}

function randomWalk() {

  setInterval(() => {

    if (!bot || !bot.entity) return;
    if (manualControl) return;

    const pos = bot.entity.position;

    const x = pos.x + (Math.random() * 8 - 4);
    const z = pos.z + (Math.random() * 8 - 4);

    bot.pathfinder.setGoal(new goals.GoalBlock(x, pos.y, z));

  }, 20000);

}

function idleActions() {

  setInterval(() => {

    if (!bot || !bot.entity) return;

    const actions = ["jump", "look", "swing"];

    const action = actions[Math.floor(Math.random() * actions.length)];

    if (action === "jump") {

      bot.setControlState("jump", true);

      setTimeout(() => {
        bot.setControlState("jump", false);
      }, 400);

    }

    if (action === "look") {

      bot.look(
        Math.random() * Math.PI * 2,
        (Math.random() - 0.5) * 0.5,
        true
      );

    }

    if (action === "swing") {

      bot.swingArm();

    }

  }, 15000);

}

function randomTalking() {

  const lines = [
    "koi diamonds mila kya?",
    "PvP kare koi?",
    "server ka base mast hai",
    "bro main thoda mining pe ja raha hu",
    "ye kisne build kiya?"
  ];

  setInterval(() => {

    if (!bot || !bot.entity) return;

    if (Math.random() < 0.35) {

      const msg = lines[Math.floor(Math.random() * lines.length)];

      bot.chat(msg);

    }

  }, 90000);

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
