import { Schema } from "mongoose";
export default {
  name: "Roles",
  schema: new Schema({
    name: {
      type: String,
      required: true,
    },
    roleId: {
      type: String,
      required: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    type: {
      type: String,
      required: true,
      lowercase: true,
    },
    color: {
      type: String,
      required: true,
    },
    guildId: {
      type: String,
      required: true,
    },
  }),
};
