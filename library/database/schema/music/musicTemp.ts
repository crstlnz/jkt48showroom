import { Schema } from "mongoose";
export default {
  name: "MusicServerTemp",
  schema: new Schema({
    data: {
      type: Object,
      required: true,
    },
  }),
};
