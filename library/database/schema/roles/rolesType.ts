import { Schema } from "mongoose";
const rolesType = new Schema({
  name: {
    type: String,
    required: true,
    lowercase: true,
  },
  title: {
    type: String,
  },
  description: {
    type: String,
  },
  guildId: {
    type: String,
    required: true,
  },
});

rolesType.index({ name: 1, guildId: 1 }, { unique: true });

export default {
  name: "RolesType",
  schema: rolesType,
};
