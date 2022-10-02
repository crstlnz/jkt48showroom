import mongoose from "mongoose";
export default defineEventHandler(() => {
  if (mongoose.connection.readyState !== 1)
    throw createError({ statusCode: 503, statusMessage: "Service Unavailable" });
});
