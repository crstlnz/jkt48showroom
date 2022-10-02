import { Schema } from "mongoose";
export default {
  name: "OshiResult",
  schema: new Schema({
    name: {
      type: String,
    },
    result: {
      type: [
        {
          id: String,
          rank: Number,
          _id: false,
        },
      ],
    },
  }),
};
