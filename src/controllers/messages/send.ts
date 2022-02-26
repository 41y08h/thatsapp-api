import Joi from "joi";
import { RequestHandler } from "express";
import Message from "../../entities/Message";
import User from "../../entities/User";

const MessageInputSchema = Joi.object({
  text: Joi.string().required(),
  sendTo: Joi.string().required(),
});

const sendMessage: RequestHandler = async (req, res) => {
  const { text, sendTo } = req.body;

  const { error } = MessageInputSchema.validate({ text, sendTo });
  if (error) {
    return res.status(422).json({
      error: {
        message: error.message,
        code: 422,
      },
    });
  }

  const sendToUser = await User.findOne({ username: sendTo });
  if (!sendToUser) {
    return res.status(400).json({
      error: {
        message: "There was an error sending the message",
        code: 404,
      },
    });
  }

  const message = await Message.create({
    text,
    fromUserId: req.user.id,
    toUserId: sendToUser.id,
  }).save();

  res.json(message);
};

export default sendMessage;
