import { Router } from "express";
import MessagesController from "../controllers/messages";
import authenticate from "../middlewares/authenticate";

const messages = Router();

messages.post("/send", authenticate, MessagesController.send);

export default messages;
