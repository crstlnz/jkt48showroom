import { Schema } from "mongoose";
export default {
  name: "Userdata",
  schema: new Schema({
    userId: {
      type: String,
      required: true,
    },
    playlistState: {
      type: Schema.Types.ObjectId,
    },
    firebaseToken: {
      type: String,
    },
    showroomNotif: {
      type: Array,
      default: [],
    },
  }),
};
