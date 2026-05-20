import TelegramBot from "node-telegram-bot-api";
import { TelegramSubscriber } from "../models/telegramSubscriber.model.js";
import dotenv from "dotenv";

dotenv.config();


const bot = new TelegramBot(
  process.env.TELEGRAM_BOT_TOKEN,
  {
    polling: true,
  }
);

// Listen For New Users
bot.on("message", async (msg) => {

  try {

    const chatId = msg.chat.id;

    await TelegramSubscriber.findOneAndUpdate(

      { chatId },

      {
        chatId,
        username: msg.from.username,
        firstName: msg.from.first_name,
      },

      { upsert: true }
    );

    await bot.sendMessage(

      chatId,

      "✅ You are now subscribed to earthquake alerts."
    );

  } catch(error) {

    console.log(error);
  }
});

export default bot;