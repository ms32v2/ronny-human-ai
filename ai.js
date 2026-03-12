require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let roastMode = false;

function setRoastMode(state) {
  roastMode = state;
}

// Technoblade style personality
function getPersonality() {

  if (roastMode) {
    return `
You are Ronny, a confident Minecraft PvP gamer inspired by Technoblade.

Rules:
- Speak ONLY Hinglish
- Short Minecraft chat style sentences
- Slightly sarcastic
- Roast players but keep it funny
- Gamer attitude
- Never say you are an AI
- Never say "lag ho gaya"
- Keep replies under 2 lines
`;
  }

  return `
You are Ronny, a confident Minecraft gamer inspired by Technoblade.

Personality:
- Chill PvP player
- Funny gamer humor
- Slightly sarcastic
- Talks like a real Minecraft player
- Only Hinglish

Rules:
- Short chat messages
- No AI mentions
- No repeating same lines
- Never say "lag ho gaya"
`;
}

async function askAI(username, message) {

  try {

    const completion = await openai.chat.completions.create({

      model: "gpt-4o-mini",

      messages: [
        {
          role: "system",
          content: getPersonality()
        },
        {
          role: "user",
          content: `${username}: ${message}`
        }
      ],

      temperature: 0.9,
      max_tokens: 80

    });

    let reply = completion.choices[0].message.content;

    if (!reply || reply.length < 2) {
      return "hmm interesting 👀";
    }

    return reply;

  } catch (err) {

    console.log("AI Error:", err.message);

    // fallback responses instead of repeating same message
    const fallback = [
      "bro abhi mining mood me hu ⛏️",
      "ruk zara chest sort kar raha hu",
      "hmm kya bola tune?",
      "server pe chaos chal raha hai 😂",
      "PvP kare kya?"
    ];

    return fallback[Math.floor(Math.random() * fallback.length)];

  }

}

module.exports = {
  askAI,
  setRoastMode
};
