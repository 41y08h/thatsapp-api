import User from "../entities/User";

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      JWT_SECRET: string;
      NODE_ENV: "production" | "development";
    }
  }
  namespace Express {
    interface Request {
      user: User;
    }
  }
}

declare module "socket.io" {
  interface Socket {
    user: User;
  }
}

export {};
