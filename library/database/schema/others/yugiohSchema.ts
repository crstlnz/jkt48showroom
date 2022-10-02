import { Schema } from "mongoose";
export default {
  name: "YugiohCard",
  schema: new Schema({
    id: {
      type: Number,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  }),
};
