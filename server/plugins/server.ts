/* eslint-disable no-console */
import * as dotenv from "dotenv";
import database from "../../library/database/database";
export default defineNitroPlugin(async ({ h3App }) => {
  console.log("Init");
  dotenv.config();
  database.run();
  await import("../../library/redis").then((redis) => {
    redis.default.connect();
  });
});
