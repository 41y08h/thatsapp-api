import "dotenv/config";
import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import routes from "./routes";
import { Server } from "socket.io";
import { createConnection } from "typeorm";
import parseUser from "./middlewares/parseUser";
import connectedUsers from "./ws/connectedUsers";
import cors from "cors";
import config from "./config";
import jwt from "jsonwebtoken";
import createDebug from "debug";
import User from "./entities/User";
import { IMessageType } from "./interfaces/mesasge";
import fileUpload from "express-fileupload";

async function main() {
  const debug = createDebug("app");
  const app = express();
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use("/localstore", express.static(config.paths.localstore));

  const server = require("http").createServer(app);
  const io = new Server(server, {
    allowEIO3: true,
  });

  await createConnection();
  debug("database connected");

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) throw new Error("Unauthenticated");

      type T = jwt.JwtPayload;
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as T;

      socket.user = await User.findOne({ where: { id: decoded.id } });
      connectedUsers.addUser(socket, socket.user);
      next();
    } catch {
      const error = new Error("Unauthenticated");
      console.log("Unauthenticated");
      next(error);
    }
  });

  io.on("connection", (socket) => {
    const debug = createDebug("ws");
    debug("connected");

    socket.on("send-message", async ({ text, sendTo, id, media }) => {
      const debug = createDebug("ws:send-message");
      debug(`${text} to ${sendTo}`);

      const receiver = connectedUsers.getUser(sendTo);
      const sender = socket;

      if (!receiver) return;

      receiver.socket.emit("message", {
        id,
        text,
        media,
        message_type: media
          ? media.type.includes("image")
            ? IMessageType.IMAGE
            : IMessageType.VIDEO
          : IMessageType.TEXT,
        sender: sender.user.username,
        receiver: receiver.user.username,
        created_at: new Date().toISOString(),
      });
    });

    socket.on("read-receipt", ({ receiptFor }: { receiptFor: string }) => {
      const debug = createDebug("ws:read-receipt");
      debug(`for ${receiptFor}`);

      const user = connectedUsers.getUser(receiptFor);
      if (user) {
        user.socket.emit("read-receipt", {
          receiptFrom: socket.user.username,
        });
      }
    });

    socket.on("delivery-receipt", ({ receiptFor, messageId }) => {
      const debug = createDebug("ws:delivery-receipt");
      debug(`for ${receiptFor}`);

      const sender = connectedUsers.getUser(receiptFor);
      const receiver = socket.user;

      if (sender) {
        sender.socket.emit("delivery-receipt", {
          messageId,
          receiptFrom: receiver.username,
        });
      }
    });
  });

  app.use(express.json());
  app.use(
    fileUpload({
      limits: {
        fileSize: 16 * 1024 * 1024,
      },
    })
  );
  app.use(morgan("dev"));
  app.use(parseUser);
  app.use(routes);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    debug(`running on port ${PORT}`);
  });
}

main();
