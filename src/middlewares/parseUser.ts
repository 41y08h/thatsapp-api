import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import User from "../entities/User";

const parseUser: RequestHandler = async (req, res, next) => {
  const header = req.header("Authorization");
  if (!header) return next();

  const token = header.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as jwt.JwtPayload;

    req.user = await User.findOne({
      where: { id: decoded.id },
    });
  } catch (error) {}

  next();
};

export default parseUser;
