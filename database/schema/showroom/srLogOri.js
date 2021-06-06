let { Schema } = require("mongoose");

let showroomLogListSchema = new Schema({
  data_id: {
    type: String,
    required: true,
    unique: true,
  },
  live_info: {
    start_date: {
      type: Date,
      required: true,
    },
    end_date: {
      type: Date,
      required: true,
    },
  },
  room_id: {
    type: Number,
  },
  // room_info: {
  //   // type: mongoose.Schema.Types.ObjectId,
  //   // ref: "Showroom",
  //   id: {
  //     type: Number,
  //     required: true,
  //   },
  //   name: {
  //     type: String,
  //     required: true,
  //   },
  //   url: {
  //     type: String,
  //     required: true,
  //   },
  //   img: {
  //     type: String,
  //     required: true,
  //   },
  //   group: {
  //     type: String,
  //     default: null,
  //   },
  // },
  gift_data: {
    type: Array,
    default: [],
    // required: true,
  },
  total_point: {
    type: Number,
    default: 0,
  },
  created_at: {
    type: Date,
    required: true,
  },
});

showroomLogListSchema.virtual("room_info", {
  ref: "Showroom", // The model to use
  localField: "room_id", // The field in playerListSchema
  foreignField: "room_id", // The field on videoSchema. This can be whatever you want.
  justOne: true,
});

module.exports = {
  name: "ShowroomLog",
  schema: showroomLogListSchema,
};

/** 
 NOTE : 
 arti _v
 148 : versi terbaru ada log stage_list dan jumlah penonton
 10 : versi old lom ada detail gifts tapi mungkin udah di generate detail gift tapi tak akurat  <--- versi paling lama
 0: versi awal yang udah ada detail gifts,
*/
