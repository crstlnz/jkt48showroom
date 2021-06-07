const express = require("express");
const app = express();
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { loadNuxt, build } = require("nuxt");

async function run() {
  await require("./database/database").ready();
  app.use(express.json());
  app.use(
    express.urlencoded({
      extended: false
    })
  );
  app.use(cookieParser());
  app.use(cors({ origin: true, credentials: true }));

  if (!process.env.IS_DEV) {
    app.use(helmet({ contentSecurityPolicy: false }));
  } else {
    app.use(
      helmet({
        contentSecurityPolicy: false,
        hsts: false
      })
    );
  }

  const api = require("./api/api");
  app.use("/api", api);

  const port = process.env.IS_DEV ? 48 : process.env.PORT || 80;

  app.listen(port, function() {
    console.log("Listening on Port " + port);
  });

  const nuxt = await loadNuxt(process.env.IS_DEV ? "dev" : "start");

  app.use(nuxt.render);

  if (process.env.IS_DEV) {
    build(nuxt);
  }
}

run();
