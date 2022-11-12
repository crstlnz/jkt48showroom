import { connection } from "~/library/database/database";
export default defineEventHandler(() => {
  if (connection.readyState !== 1) throw createError({ statusCode: 503, statusMessage: "Service Unavailable" });
});
