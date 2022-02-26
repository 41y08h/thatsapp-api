import { RequestHandler } from "express";

const verify: RequestHandler = async (req, res) => {
  const user = req.user;

  return res.json({
    isAuthenticated: Boolean(req.user),
    user,
  });
};

export default verify;
