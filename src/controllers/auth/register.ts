import { RequestHandler } from "express";
import Joi from "joi";
import jwt from "jsonwebtoken";
import { User } from "../../entities/User";
import bcrypt from "bcrypt";

const RegisterSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(255).required(),
});

const register: RequestHandler = async (req, res) => {
  const { username, password } = req.body;

  const { error } = RegisterSchema.validate({ username, password });
  if (error) {
    return res.status(422).json({
      error: {
        message: error.message,
        code: 422,
      },
    });
  }

  // Hash password
  const salt = bcrypt.genSaltSync();
  const hashedPassword = bcrypt.hashSync(password, salt);

  const user = await User.create({
    username,
    password: hashedPassword,
  }).save();

  // Sign auth token
  const token = jwt.sign(
    { id: user.id, username: user.id },
    process.env.JWT_SECRET
  );

  return res.status(201).json({
    token,
    user,
  });
};

export default register;
