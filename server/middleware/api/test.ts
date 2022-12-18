import { connection } from "~~/library/database";
export default defineEventHandler((event) => {
  if (event.req.url?.startsWith("/api"))
    if (connection.readyState !== 1)
      throw createError({
        statusCode: 503,
        statusMessage: "Service Unavailable",
      });
});
