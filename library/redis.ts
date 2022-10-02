/* eslint-disable no-console */
import { createClient } from "redis";
const client = createClient({
  url: process.env.REDIS_URI,
});

client.on("error", (err) => console.log("Redis Client Error", err));
client.on("connect", () => console.log("Connected to Redis"));
export default client;
