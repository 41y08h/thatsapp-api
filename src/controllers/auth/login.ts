import { RequestHandler } from "express";
import Joi from "joi";
import User from "../../entities/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const LoginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

const login: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  const { error } = LoginSchema.validate({ username, password });
  if (error) {
    return res.status(422).json({
      error: {
        message: error.message,
        code: 422,
      },
    });
  }

  // Check if user exists
  const user = await User.findOne(
    { username },
    { select: ["id", "username", "password"] }
  );
  if (!user) {
    return res.status(400).json({
      error: {
        message: "Username or password is invalid",
        code: 400,
      },
    });
  }

  const isPasswordCorrect = bcrypt.compareSync(password, user.password);

  if (!isPasswordCorrect) {
    return res.status(400).json({
      error: {
        message: "Username or password is invalid",
        code: 400,
      },
    });
  }

  // Sign auth token
  const token = jwt.sign(
    { id: user.id, username: user.username },
    process.env.JWT_SECRET
  );

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      username: user.username,
    },
  });
};

export default login;
