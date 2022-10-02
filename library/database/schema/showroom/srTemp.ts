import { Schema } from "mongoose";
export default {
  name: "ShowroomTemp",
  schema: new Schema({
    name: {
      type: String,
      required: true,
    },
    room_id: {
      type: Number,
      required: true,
    },
    img: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    group: {
      type: String,
    },
    start_date: {
      type: Date,
    },
    data_id: {
      type: String,
      required: true,
    },
    live_id: {
      type: Number,
    },
    penonton: {
      history: {
        type: Array,
        default: [],
      },
      peak: {
        type: Number,
        default: 0,
      },
    },
    users: {
      type: Array,
      default: [],
    },
    stage_list: {
      type: Array,
      default: [],
    },
    gift_list: {
      type: Array,
      default: [],
    },
    gift_log: {
      type: Array,
      default: [],
    },
    message: {
      channel_id: { type: String },
      message_id: { type: String },
    },
    is_active: {
      type: Boolean,
      required: true,
    },
    host: { type: String },
    key: { type: String },
    bg: { type: String },
    bot_id: { type: String },
    created_at: { type: Date },
    screenshot: {
      folder: String,
      format: String,
      list: {
        type: [Number],
        default: [],
      },
    },
  }),
};
