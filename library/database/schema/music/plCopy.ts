import { Schema } from "mongoose";
export default {
  name: "PlCopy",
  schema: new Schema({
    id: {
      /// youtubeid
      type: String,
      required: true,
    },
    playlistId: {
      type: Schema.Types.ObjectId,
    },
    userId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
    },
    thumbnails: {
      type: String,
    },
    nomor: {
      type: Number,
    },
  }),
};
