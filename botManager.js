const mineflayer = require("mineflayer")
const config = require("./config.json")

function createBot(username,io){

const bot = mineflayer.createBot({
host: config.server.host,
port: config.server.port,
username: username
})

bot.on("spawn",()=>{

console.log(username+" joined server")

require("./modules/login")(bot)
require("./modules/antiAfk")(bot)
require("./modules/movement")(bot)
require("./modules/chatLogger")(bot,io)
require("./modules/playerTracker")(bot,io)

})

bot.on("end",()=>{
console.log("Bot disconnected")
setTimeout(()=>createBot(username,io),config.reconnectDelay)
})

}

function startBots(io){

config.bots.forEach(name=>{
createBot(name,io)
})

}

module.exports = startBots
