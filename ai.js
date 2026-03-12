require("dotenv").config();
const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

let roastMode = false;

function setRoastMode(state) {
  roastMode = state;
}

async function askAI(username, message) {

  const personality = roastMode
    ? "You are Ronny, a funny minecraft gamer who roasts players but stays friendly. Always reply in Hinglish."
    : "You are Ronny, a chill minecraft player. Talk casually like a gamer and only speak Hinglish.";

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: personality },
        { role: "user", content: `${username}: ${message}` }
      ],
      max_tokens: 80
    });

    return completion.choices[0].message.content;

  } catch (err) {

    console.log(err);
    return "Lag ho gaya bhai 😅";

  }

}

module.exports = { askAI, setRoastMode };
