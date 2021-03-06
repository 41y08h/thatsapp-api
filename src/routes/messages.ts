import { Router } from "express";
import MessagesController from "../controllers/messages";
import authenticate from "../middlewares/authenticate";

const messages = Router();

messages.post("/", authenticate, MessagesController.send);
messages.post("/upload-media", authenticate, MessagesController.uploadMedia);

export default messages;
