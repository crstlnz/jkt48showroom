let { Schema } = require("mongoose");
module.exports = {
  name: "Member",
  schema: new Schema({
    name: {
      type: String,
      required: true,
    },
    group: {
      type: String,
      require: true,
    },
    isGraduate: {
      type: Boolean,
    },
    img: {
      type: String,
    },
    stage48: {
      type: String,
    },
  }),
};
