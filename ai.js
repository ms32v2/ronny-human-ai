require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let roastMode = false;

function setRoastMode(value) {
  roastMode = value;
}

async function askAI(username, message) {

  const personality = roastMode
    ? `You are Ronny, a funny minecraft player who roasts people but still friendly. Speak only Hinglish.`
    : `You are Ronny, a chill minecraft gamer. Speak only Hinglish.`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: personality },
      { role: "user", content: `${username}: ${message}` }
    ]
  });

  return completion.choices[0].message.content;
}

module.exports = { askAI, setRoastMode };
