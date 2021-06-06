let { Schema } = require("mongoose");
module.exports = {
  name: "Showroom",
  schema: new Schema({
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    group: {
      type: String,
    },
    url: {
      type: String,
      required: true,
    },
    room_id: {
      type: Number,
      required: true,
      unique: true,
    },
  }),
};
