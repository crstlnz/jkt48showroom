import { Schema, model } from "mongoose";
import Member from "../48group/members";
const ShowroomSchema = new Schema<IShowroomMember>({
  name: {
    type: String,
    required: true,
  },
  img: {
    type: String,
    required: true,
  },
  img_square: {
    type: String,
  },
  description: {
    type: String,
  },
  group: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  room_id: {
    type: Number,
    required: true,
    unique: true,
  },
  room_exists: {
    type: Boolean,
    default: true,
  },
  is_active: {
    type: Boolean,
    default: true,
  },
  member_data: {
    type: Schema.Types.ObjectId,
    ref: Member,
  },
});

export default model<IShowroomMember>("Showroom", ShowroomSchema);
