import { Schema } from "mongoose";
export default {
  name: "DotaHeroes",
  schema: new Schema({
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
  }),
};
