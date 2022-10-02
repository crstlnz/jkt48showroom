import { Schema, model } from "mongoose";

export default model<IShowroomStats>(
  "ShowroomStat",
  new Schema<IShowroomStats>({
    room_id: {
      type: Number,
      unique: true,
      required: true,
      index: true,
    },
    ranks: {
      member: [
        {
          room_id: Number,
          name: String,
          img: String,
          url: String,
          point: Number,
          live_count: Number,
          total_viewer: Number,
        },
      ],
      fans: [{ name: String, avatar_id: Number, id: Number, fans_point: Number }],
    },
    stats: [
      {
        title: String,
        img: {
          title: String,
          src: String,
        },
        value: String,
      },
    ],
    date: {
      from: Date,
      to: Date,
    },
  })
);
