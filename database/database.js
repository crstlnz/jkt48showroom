const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
console.log("Initiating Database...");
mongoose.set("useCreateIndex", true);
const connection = mongoose.connection;
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

connection.on("close", () => {
  console.log(`MongoDB closed!`);
});

function loadSemua(dir, arr = []) {
  let root = path.resolve(__dirname, dir);
  for (let d of fs.readdirSync(root)) {
    let stat = fs.lstatSync(path.resolve(__dirname, dir + "/" + d));
    if (stat.isFile()) {
      let modul = require(dir + "/" + d);
      if (modul.name && modul.schema) arr.push(modul);
    } else if (stat.isDirectory()) {
      loadSemua(dir + "/" + d, arr);
    }
  }
  return arr;
}

connection.once("open", () => {
  console.log("MongoDB Connected!");
  let schemaDir = "./schema";
  let schemas = [...loadSemua(schemaDir)];

  for (let s of schemas) {
    mongoose.model(s.name, s.schema);
  }

  console.log(`${schemas.length} Schemas Loaded!`);
});

connection.on("error", err => {
  error.send(err);
  console.log(err);
});

module.exports = mongoose;
module.exports.ready = () => {
  return new Promise((resolve, reject) => {
    try {
      if (mongoose.connection.readyState == 1) {
        return resolve(mongoose);
      } else {
        mongoose.connection.once("open", () => {
          return resolve(mongoose);
        });
      }
    } catch (e) {
      return reject(e);
    }
  });
};
