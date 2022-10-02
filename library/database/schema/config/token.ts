import { Schema } from "mongoose";
export default {
  name: "Token",
  schema: new Schema({
    token: {
      type: String,
      required: true,
    },
    refreshToken: {
      type: String,
      required: true,
    },
    userId: {
      type: String,
      required: true,
    },
  }),
};
