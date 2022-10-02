/* eslint-disable no-console */
import cors from "cors";
import * as dotenv from "dotenv";
import database from "../library/database/database";
export default async ({ h3App }) => {
  console.log("Init");
  dotenv.config();
  database.run();
  await import("../library/redis").then((redis) => {
    redis.default.connect();
  });

  h3App.use(
    cors({
      origin: process.env.BASE_URL,
      credentials: true,
    })
  );
  h3App.use(function (_req, res, next) {
    res.header("Access-Control-Allow-Origin", process.env.BASE_URL);
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "GET");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
    );
    next();
  });
};
