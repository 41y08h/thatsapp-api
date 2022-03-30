import "dotenv/config";
import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { createConnection } from "typeorm";
import routes from "./routes";
import parseUser from "./middlewares/parseUser";
import { Server } from "socket.io";
import connectedUsers from "./ws/connectedUsers";
import jwt from "jsonwebtoken";
import User from "./entities/User";
import cors from "cors";
import createDebug from "debug";
import fs from "fs";
import GHaaS from "./services/ghaas";
import { IImage } from "./interfaces/image";

async function main() {
  const app = express();
  app.use(
    cors({
      origin: "*",
    })
  );

  const server = require("http").createServer(app);
  const io = new Server(server, {
    allowEIO3: true,
  });

  await createConnection();
  console.log("Connected to database");

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

    socket.on("send-message", ({ text, sendTo, id }) => {
      const debug = createDebug("ws:send-message");
      debug(`${text} to ${sendTo}`);

      const receiver = connectedUsers.getUser(sendTo);
      const sender = socket;

      if (receiver) {
        receiver.socket.emit("message", {
          id,
          text,
          sender: sender.user.username,
          receiver: receiver.user.username,
          created_at: new Date().toISOString(),
        });
      }
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

    socket.on(
      "image",
      async ({ image, sendTo }: { image: IImage; sendTo: string }) => {
        const debug = createDebug("ws:image");

        const extension = image.type.split("/")[1];
        const filename = `${
          socket.user.username
        }-${new Date().getTime()}.${extension}`;

        const url = await GHaaS.uploadFile(image.base64, filename);

        debug(`${filename} uploaded to ${url}`);

        const receiver = connectedUsers.getUser(sendTo);
        const sender = socket;

        if (receiver) {
          receiver.socket.emit("image", {
            url,
            sender: sender.user.username,
            created_at: new Date().toISOString(),
          });
        }
      }
    );
  });

  app.use(express.json());
  app.use(morgan("dev"));
  app.use(parseUser);
  app.use(routes);

  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
