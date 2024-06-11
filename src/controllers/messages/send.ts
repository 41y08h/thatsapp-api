import Joi from "joi";
import { RequestHandler } from "express";
import Message from "../../entities/Message";
import User from "../../entities/User";
import { UploadedFile } from "express-fileupload";
import GHaaS from "../../services/GHaaS";
import createDebug from "debug";
import connectedUsers from "../../ws/connectedUsers";
import { IMessageType } from "../../interfaces/mesasge";

const debug = createDebug("controllers::messages:send");

const MessageInputSchema = Joi.object({
  id: Joi.number().required(),
  text: Joi.string().required(),
  sendTo: Joi.string().required(),
});

interface MessageInput {
  id: number;
  text: string;
  sendTo: string;
}

const sendMessage: RequestHandler<any, any, MessageInput> = async (
  req,
  res
) => {
  const media = req.files && (req.files.media as UploadedFile | undefined);
  const { id, text, sendTo } = req.body;

  const { error } = MessageInputSchema.validate({ id, text, sendTo });
  if (error)
    return res.status(422).json({
      error: {
        code: 422,
        message: error.message,
      },
    });

  const receiver = connectedUsers.getUser(sendTo);

  if (media) {
    const extension = media.mimetype.split("/")[1];
    const filename = `${
      req.user.username
    }-${new Date().getTime()}.${extension}`;

    const url = await GHaaS.uploadFile(media.data.toString("base64"), filename);
    debug(`${filename} uploaded to ${url}`);

    if (!receiver) return;
    receiver.socket.emit("message", {
      id,
      text,
      message_type: media.mimetype.includes("image")
        ? IMessageType.IMAGE
        : IMessageType.VIDEO,
      media: {
        url,
        filename,
        size: media.size,
        type: media.mimetype,
      },
      sender: req.user.username,
      receiver: receiver.user.username,
      created_at: new Date().toISOString(),
    });
  } else {
    if (!receiver) return;
    receiver.socket.emit("message", {
      id,
      text,
      message_type: IMessageType.TEXT,
      sender: req.user.username,
      receiver: receiver.user.username,
      created_at: new Date().toISOString(),
    });
  }

  res.sendStatus(200);
};

export default sendMessage;
