/* eslint-disable camelcase */
import { Schema, model, Model } from 'mongoose'
import Showroom from './Showroom'
import ShowroomGift from './ShowroomGift'
import ShowroomUser from './ShowroomUser'
import config from '~~/app.config'

interface IShowroomLogModel extends Model<IShowroomLog> {
  getDetails(id: string | number): Promise<IShowroomLogDetail>;
}

const showroomLogSchema = new Schema<IShowroomLog, IShowroomLogModel>({
  is_dev: {
    type: Boolean,
    default: false
  },
  live_id: {
    type: Number,
    unique: true
  },
  jpn_rate: Number,
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
        index: true,
        default: 0
      }
    },
    start_date: {
      type: Date,
      required: true
    },
    end_date: {
      type: Date,
      required: true,
      index: true
    }
  },
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
  },
  total_point: {
    type: Number,
    default: 0,
    index: true
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
        avatar_id: {
          type: Number,
          default: 1
        },
        name: String
      }
    ]
  }
})

showroomLogSchema.virtual('room_info', {
  ref: Showroom,
  localField: 'room_id',
  foreignField: 'room_id',
  justOne: true
})
// showroomLogSchema.virtual('room_info', {
//   ref: IdolMember,
//   localField: 'room_id',
//   foreignField: 'showroom.room_id',
//   justOne: true
// })

showroomLogSchema.virtual('gift_data.gift_list', {
  ref: ShowroomGift,
  localField: 'gift_data.gift_id_list',
  foreignField: 'gift_id'
})

showroomLogSchema.virtual('user_list', {
  ref: ShowroomUser,
  localField: 'users.user_id',
  foreignField: 'user_id'
})

showroomLogSchema.statics.getDetails = async function (data_id: string | number): Promise<IShowroomLogDetail | null> {
  const doc = await this.findOne({ data_id })
    .populate({
      path: 'user_list',
      options: { select: '-_id name avatar_url user_id image' }
    })
    .populate({
      path: 'room_info',
      options: {
        select: '-_id name img url -room_id member_data is_graduate is_group'
      }
    })
    .populate({
      path: 'gift_data.gift_list',
      options: { select: '-_id gift_id free image point' }
    })
    .lean()

  if (!doc) { return null }

  const viewer = doc.live_info?.penonton
    ? {
        history: doc.live_info?.penonton?.history?.map(i => ({
          num: i.num,
          date: i.waktu.toISOString()
        })),
        peak: doc.live_info?.penonton?.peak
      }
    : undefined
  return {
    data_id: doc.data_id,
    room_info: {
      name: doc.room_info?.name ?? 'Member not found!',
      img: doc.room_info?.img ?? config.errorPicture,
      url: doc.room_info?.url ?? '',
      is_graduate: doc.room_info?.member_data?.isGraduate ?? doc.room_info?.is_group ?? false,
      is_group: doc.room_info?.is_group ?? false
    },
    live_info: {
      screenshot: doc.live_info?.screenshot,
      background_image: doc.live_info?.background_image,
      stage_list:
        doc.live_info?.stage_list?.map<IStageList>(i => ({
          date: i.date,
          list: i.list
        })) ?? [],
      viewer: {
        history: viewer?.history ?? [],
        peak: viewer?.peak ?? 0
      },
      date: {
        start: doc.live_info?.start_date.toISOString(),
        end: doc.live_info?.end_date.toISOString()
      },
      gift: {
        log: doc.gift_data?.gift_log?.map(i => ({
          total: i.total,
          user_id: i.user_id,
          gifts:
            i.gifts?.map(g => ({
              id: g.gift_id,
              num: g.num,
              date: g.date.toISOString()
            })) ?? []
        })).sort((a, b) => b.total - a.total),
        list:
          doc.gift_data?.gift_list?.map(g => ({
            id: g.gift_id,
            free: g.free,
            point: g.point
          })) ?? []
      }
    },
    jpn_rate: doc.jpn_rate,
    room_id: doc.room_id,
    total_point: doc.total_point,
    users:
      doc.users?.map(u => ({
        id: u.user_id,
        avatar_id: u.avatar_id,
        name: u.name
      })) ?? [],
    created_at: doc.created_at.toISOString()
  }
}

showroomLogSchema.index({ data_id: 1 }, { unique: true })
export default model<IShowroomLog, IShowroomLogModel>('ShowroomLog', showroomLogSchema)
