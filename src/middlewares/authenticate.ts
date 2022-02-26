import { RequestHandler } from "express";

const authenticate: RequestHandler = async (req, res, next) => {
  if (req.user) next();
  else
    res.status(401).json({
      error: {
        message: "Unauthenticated",
        code: 401,
      },
    });
};

export default authenticate;
