require("dotenv").config();
const http = require("http");
const { Server } = require("socket.io");

const { askAI, setRoastMode } = require("./ai");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("panel/public"));

server.listen(3000, () => {
  console.log("Control panel running on port 3000");
});

let manualControl = false;

const bot = mineflayer.createBot({
  host: process.env.MC_HOST,
  port: parseInt(process.env.MC_PORT),
  username: "Ronny"
});

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  console.log("Ronny joined server");

  const mcData = require("minecraft-data")(bot.version);
  const movements = new Movements(bot, mcData);

  bot.pathfinder.setMovements(movements);

  randomWalk();
});

function randomWalk() {
  setInterval(() => {

    if (manualControl) return;

    const pos = bot.entity.position;

    const x = pos.x + (Math.random() * 10 - 5);
    const z = pos.z + (Math.random() * 10 - 5);

    bot.pathfinder.setGoal(new goals.GoalBlock(x, pos.y, z));

  }, 15000);
}

bot.on("chat", async (username, message) => {

  if (username === bot.username) return;

  const reply = await askAI(username, message);

  bot.chat(reply);

  io.emit("chat", `${username}: ${message}`);
  io.emit("chat", `Ronny: ${reply}`);
});

io.on("connection", socket => {

  socket.on("say", msg => {
    bot.chat(msg);
  });

  socket.on("roastMode", state => {
    setRoastMode(state);
  });

  socket.on("manual", state => {
    manualControl = state;
  });

});
