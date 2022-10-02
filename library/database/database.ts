/* eslint-disable no-console */
import mongoose from "mongoose";
const connection = mongoose.connection;
connection.on("close", () => {
  console.log(`MongoDB closed!`);
});
connection.once("open", () => {
  console.log("MongoDB Connected!");
});
connection.on("error", (err) => {
  console.log(err);
});

async function run() {
  try {
    console.log("Connecting Database...");
    await mongoose.connect(process.env.MONGODB_URI);
  } catch (e) {
    console.log("Failed connect to database!");
    setTimeout(() => {
      run();
    }, 1000);
  }
}

export default {
  run,
};
