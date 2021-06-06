let { Schema } = require("mongoose");
module.exports = {
  name: "Config",
  schema: new Schema({
    configname: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  }),
};
