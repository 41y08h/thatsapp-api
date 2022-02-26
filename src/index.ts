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

async function main() {
  const app = express();

  const server = require("http").createServer(app);
  const io = new Server(server, {
    allowEIO3: true,
    cors: {
      origin: "*",
    },
  });

  await createConnection();
  console.log("Connected to database");

  io.use(async (socket, next) => {
    const header = socket.handshake.headers.authorization;
    if (!header) return next();

    const token = header.split(" ")[1];

    try {
      type T = jwt.JwtPayload;
      const decoded = jwt.verify(token, process.env.JWT_SECRET) as T;

      const user = await User.findOne({ where: { id: decoded.id } });
      connectedUsers.addUser(socket, user);
      next();
    } catch {
      const error = new Error("Unauthenticated");
      next(error);
    }
  });
  io.on("connection", (socket) => {
    console.log("Socket connected");

    socket.on("send-message", ({ text, sendTo }) => {
      const client = connectedUsers.getUser(sendTo);
      if (client) {
        client.socket.emit("message", { text });
      }
    });
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
