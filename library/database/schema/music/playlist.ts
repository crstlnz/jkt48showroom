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
    songs: {
      default: [],
      type: [
        {
          id: {
            /// youtubeid
            type: String,
            required: true,
          },
          // playlistId: {
          //   type: Schema.Types.ObjectId,
          // },
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
        },
      ],
    },
  },
  { timestamps: true }
);

// pSchema.virtual('songs', {
//   ref: 'Playlist_Song',
//   localField: '_id',
//   foreignField: 'playlistId',
// })

export default {
  name: "Playlist",
  schema: pSchema,
};
