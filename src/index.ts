import "dotenv/config";
import "reflect-metadata";
import express from "express";
import morgan from "morgan";
import { createConnection } from "typeorm";
import routes from "./routes";
import parseUser from "./middlewares/parseUser";

async function main() {
  const app = express();

  await createConnection();
  console.log("Connected to database");

  app.use(express.json());
  app.use(morgan("dev"));
  app.use(parseUser);
  app.use(routes);

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();
