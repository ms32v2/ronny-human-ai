require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let roastMode = false;

// memory of recent chat
let memory = [];

function setRoastMode(state) {
  roastMode = state;
}

function systemPrompt() {

  if (roastMode) {
    return `
You are Ronny, a skilled Minecraft PvP player inspired by Technoblade.

Personality:
- confident gamer
- sarcastic humor
- sometimes roasts people
- friendly but competitive

Rules:
- speak only Hinglish (Hindi + English mix)
- short Minecraft chat style
- behave like a real player
- never mention AI
`;
  }

  return `
You are Ronny, a real Minecraft player chatting on a multiplayer server.

Personality:
- chill gamer
- funny
- sometimes sarcastic
- talks like a human Minecraft player

Rules:
- always speak Hinglish
- keep messages short
- talk like a real player
- never say you are an AI
`;
}

async function askAI(username, message) {

  try {

    memory.push({
      role: "user",
      content: `${username}: ${message}`
    });

    // keep memory small
    if (memory.length > 10) {
      memory.shift();
    }

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        { role: "system", content: systemPrompt() },
        ...memory
      ],

      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.5,
      max_tokens: 80

    });

    const reply = completion.choices[0].message.content;

    memory.push({
      role: "assistant",
      content: reply
    });

    return reply;

  } catch (err) {

    console.log("AI error:", err.message);

    const fallback = [
      "bro kya bola tune?",
      "ruk thoda chest sort kar raha hu",
      "hmm interesting 👀",
      "server thoda laggy lag raha hai",
      "PvP kare kya?"
    ];

    return fallback[Math.floor(Math.random() * fallback.length)];

  }

}

module.exports = {
  askAI,
  setRoastMode
};
