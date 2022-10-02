import { Schema } from "mongoose";
const pSchema = new Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

pSchema.virtual("songs", {
  ref: "Playlist_Song",
  localField: "_id",
  foreignField: "playlistId",
});

export default {
  name: "PlaylistList",
  schema: pSchema,
};
