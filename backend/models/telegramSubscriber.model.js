import mongoose from "mongoose";

const telegramSubscriberSchema =
  new mongoose.Schema({

    chatId: {
      type: String,
      unique: true,
      required: true,
    },

    username: String,

    firstName: String,

  }, {
    timestamps: true,
  });

export const TelegramSubscriber =
  mongoose.model(
    "TelegramSubscriber",
    telegramSubscriberSchema
  );