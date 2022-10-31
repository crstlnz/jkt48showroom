import cors from "cors";

export default defineNitroPlugin(({ h3App }) => {
  // h3App.use(
  //   cors({
  //     origin: "http://localhost:3000",
  //     credentials: true,
  //   })
  // );
  // h3App.use(function (req, res, next) {
  //   res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  //   res.header("Access-Control-Allow-Credentials", true);
  //   res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE,OPTIONS");
  //   res.header(
  //     "Access-Control-Allow-Headers",
  //     "Origin,X-Requested-With,Content-Type,Accept,content-type,application/json"
  //   );
  //   next();
  // });
});
