let { Schema } = require("mongoose");

let showroomLogBackupListSchema = new Schema({
  is_dev: {
    type: Boolean,
    default: false
  },
  live_id: {
    type: Number,
    unique: true
  },
  data_id: {
    type: String,
    required: true,
    unique: true
  },
  live_info: {
    screenshot: {
      folder: String,
      format: String,
      list: {
        type: [Number],
        default: []
      }
    },
    background_image: {
      type: String
    },
    stage_list: {
      type: [
        {
          _id: false,
          date: {
            type: Date
          },
          list: {
            type: [Number]
          }
        }
      ],
      default: []
    },
    penonton: {
      history: {
        type: [
          {
            _id: false,
            num: {
              type: Number
            },
            waktu: {
              type: Date
            }
          }
        ],
        default: []
      },
      peak: {
        type: Number,
        default: 0
      }
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true
    }
  },
  // user_ids: {
  //   type: [Number],
  //   default: [],
  // },
  // user_lists: {
  //   type: [
  //     {
  //       _id: false,
  //       user_id: Number,
  //       name: String,
  //       avatar_url: String,
  //     },
  //   ],
  // },
  room_id: {
    type: Number
  },
  gift_data: {
    gift_id_list: { type: [Number], default: [] },
    gift_log: {
      type: [
        {
          _id: false,
          total: Number,
          user_id: Number,
          gifts: [
            {
              _id: false,
              gift_id: Number,
              num: Number,
              date: Date
            }
          ]
        }
      ],
      default: []
    }
    // gift_log: {
    //   type: [
    //     {
    //       _id: false,
    //       user_id: Number,
    //       gift_id: Number,
    //       num: Number,
    //       date: Date,
    //     },
    //   ],
    //   default: [],
    // },
    // required: true,
  },
  total_point: {
    type: Number,
    default: 0
  },
  created_at: {
    type: Date,
    required: true
  },
  users: {
    type: [
      {
        _id: false,
        user_id: Number,
        avatar_url: String,
        name: String
      }
    ]
  }
});

showroomLogBackupListSchema.virtual("room_info", {
  ref: "Showroom",
  localField: "room_id",
  foreignField: "room_id",
  justOne: true
});

showroomLogBackupListSchema.virtual("gift_data.gift_list", {
  ref: "Showroom_Gift",
  localField: "gift_data.gift_id_list",
  foreignField: "gift_id"
});

showroomLogBackupListSchema.virtual("user_list", {
  ref: "Showroom_User",
  localField: "users.user_id",
  foreignField: "user_id"
});

// showroomLogBackupListSchema.pre("findOne", async function(next) {
//   next();
// });

// showroomLogBackupListSchema.post("findOne", async function(doc) {
//   if (!doc) return doc;
//   if (!doc.room_info) {
//     doc.room_info = {
//       name: "Nama tidak ditemukan!",
//       url: "",
//       img:
//         "https://image.showroom-cdn.com/showroom-prod/assets/img/v3/img-err-404.jpg?t=1602821561",
//       group: null,
//     };
//   }

//   if (doc.user_list && doc.user_list.length) {
//     doc.user_list = doc.user_list.reduce((a, c) => ((a[c.user_id] = c), a), {});
//   } else {
//     doc.user_list = {};
//   }

//   if (doc.gift_data.gift_list && doc.gift_data.gift_list.length) {
//     doc.gift_data.gift_list = doc.gift_data.gift_list.reduce((a, c) => ((a[c.gift_id] = c), a), {});
//   } else {
//     doc.gift_data.gift_list = {};
//   }

//   if (doc.user_ids)
//     for (let d of doc.user_ids) {
//       if (!doc.user_list[d])
//         doc.user_list[d] = {
//           avatar_url: "https://image.showroom-cdn.com/showroom-prod/image/avatar/1.png",
//           user_id: d,
//           name: "Not Found!",
//         };
//     }

//   if (doc.user_ids) delete doc.user_ids;
//   if (doc.gift_data.gift_id_list) delete doc.gift_data.gift_id_list;

//   return doc;
// });

showroomLogBackupListSchema.statics.getUserGiftDetail = async function(
  user_id
) {
  try {
    let doc = await this.aggregate([
      {
        $match: {
          "gift_data.gift_log.user_id": user_id
        }
      },
      {
        $project: {
          room_id: 1,
          data_id: "$data_id",
          user: {
            $filter: {
              input: "$users",
              as: "u",
              cond: {
                $eq: ["$$u.user_id", user_id]
              }
            }
          },
          gift: {
            $filter: {
              input: "$gift_data.gift_log",
              as: "gift",
              cond: {
                $eq: ["$$gift.user_id", user_id]
              }
            }
          }
        }
      },
      {
        $unwind: {
          path: "$gift",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: "$user",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $match: {
          "gift.gifts": {
            $exists: true,
            $ne: []
          }
        }
      },
      {
        $group: {
          _id: "$room_id",
          point: {
            $sum: "$gift.total"
          },
          user_id: {
            $last: "$user.user_id"
          },
          user: {
            $last: "$user"
          },
          last_seen: {
            $last: "$data_id"
          },
          gift_log: {
            $push: "$gift.gifts"
          }
        }
      },
      {
        $addFields: {
          gift_log: {
            $reduce: {
              input: "$gift_log",
              initialValue: [],
              in: {
                $concatArrays: ["$$this", "$$value"]
              }
            }
          }
        }
      },
      {
        $lookup: {
          from: "showrooms",
          localField: "_id",
          foreignField: "room_id",
          as: "room_info"
        }
      },
      {
        $unwind: {
          path: "$room_info",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $sort: {
          point: -1
        }
      },
      {
        $group: {
          _id: "$user_id",
          user: {
            $last: "$user"
          },
          total_point: {
            $sum: "$point"
          },
          list_room: {
            $push: {
              room: "$room_info",
              point: "$point",
              gift_list: "$gift_log"
            }
          },
          last_seen: {
            $last: "$last_seen"
          }
        }
      },
      {
        $lookup: {
          from: "showroom_gifts",
          localField: "list_room.gift_list.gift_id",
          foreignField: "gift_id",
          as: "gift_list"
        }
      }
    ]);

    doc = doc[0];
    if (doc.gift_list)
      doc.gift_list = doc.gift_list.reduce(
        (a, b) => ((a[b.gift_id] = b), a),
        {}
      );
    return doc;
  } catch (e) {
    return null;
  }
};

showroomLogBackupListSchema.statics.getUserGifts = function(
  page,
  perpage = 50
) {
  if (page < 1) page = 1;
  let limit = perpage;
  let skip = (page - 1) * limit;
  return this.aggregate([
    {
      $unwind: {
        path: "$gift_data.gift_log",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        user_id: "$gift_data.gift_log.user_id",
        point: "$gift_data.gift_log.total",
        data_id: "$data_id",
        user: {
          $filter: {
            input: "$users",
            as: "u",
            cond: {
              $eq: ["$$u.user_id", "$gift_data.gift_log.user_id"]
            }
          }
        }
      }
    },
    {
      $unwind: {
        path: "$user",
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $group: {
        _id: "$user_id",
        point: {
          $sum: "$point"
        },
        user: {
          $last: "$user"
        },
        last_seen: {
          $last: "$data_id"
        }
      }
    },
    {
      $sort: {
        point: -1
      }
    },
    {
      $skip: skip
    },
    {
      $limit: limit
    }
  ]);
};

showroomLogBackupListSchema.statics.getDetails = async function(data_id) {
  try {
    let doc = await this.findOne({ data_id: data_id })
      .populate({
        path: "user_list",
        options: { select: "-_id name avatar_url user_id image" }
      })
      .populate({
        path: "room_info",
        options: { select: "-_id name img url -room_id" }
      })
      .populate({
        path: "gift_data.gift_list",
        options: { select: "-_id gift_id free image point" }
      })
      .lean();

    if (!doc) return doc;
    if (!doc.room_info) {
      doc.room_info = {
        name: "Nama tidak ditemukan!",
        url: "",
        img:
          "https://image.showroom-cdn.com/showroom-prod/assets/img/v3/img-err-404.jpg?t=1602821561",
        group: null
      };
    }

    if (doc.user_list && doc.user_list.length) {
      doc.user_list = doc.user_list.reduce(
        (a, c) => ((a[c.user_id] = c), a),
        {}
      );
    } else {
      doc.user_list = {};
    }

    if (doc.gift_data.gift_list && doc.gift_data.gift_list.length) {
      doc.gift_data.gift_list = doc.gift_data.gift_list.reduce(
        (a, c) => ((a[c.gift_id] = c), a),
        {}
      );
    } else {
      doc.gift_data.gift_list = {};
    }

    if (doc.users)
      for (let { user_id: d } of doc.users) {
        if (!doc.user_list[d])
          doc.user_list[d] = {
            avatar_url:
              "https://image.showroom-cdn.com/showroom-prod/image/avatar/1.png",
            user_id: d,
            name: "Not Found!"
          };
      }

    if (doc.user_ids) delete doc.user_ids;
    if (doc.gift_data.gift_id_list) delete doc.gift_data.gift_id_list;

    if (doc.users)
      doc.users = doc.users.reduce((a, b) => ((a[b.user_id] = b), a), {});

    return doc;
  } catch (e) {
    console.log(e);
    return null;
  }
};

showroomLogBackupListSchema.index({ data_id: 1 }, { unique: true });

module.exports = {
  name: "ShowroomLog",
  schema: showroomLogBackupListSchema
};
