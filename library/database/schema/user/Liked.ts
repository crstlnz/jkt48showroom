import { Schema, model } from 'mongoose'
import type { Model } from 'mongoose'
import ShowroomLog from '~~/library/database/schema/showroom/ShowroomLog'
import Showroom from '~~/library/database/schema/showroom/Showroom'
import config from '~~/app.config'

interface ILikedModel extends Model<Database.ILiked> {
  getDetails(id: string | number): Promise<Database.LikeDetail>
  isLiveLiked(user_id: string | number, id: string): Promise<boolean>
}

const LikedSchema = new Schema<Database.ILiked, ILikedModel>({
  user_id: String,
  type: Number,
  liked_id: String,
}, { timestamps: true })

LikedSchema.statics.isLiveLiked = async function (user_id: string | number, id: string): Promise<boolean> {
  const doc = await this.findOne({ user_id, liked_id: id, type: 2 }).lean()
  return doc != null
}

LikedSchema.statics.getDetails = async function (user_id: string | number): Promise<Database.LikeDetail> {
  const doc = await this.find({ user_id }).sort({
    createdAt: -1,
  }).lean()
  const result: Database.LikeDetail = {
    room: [],
    live: [],
  }
  if (!doc) return result

  const ids: { room: string[]; live: string[] } = {
    room: [],
    live: [],
  }
  for (const item of doc) {
    if (item.type === 1) {
      ids.room.push(item.liked_id)
    }
    else if (item.type === 2) {
      ids.live.push(item.liked_id)
    }
  }

  const rooms = await Showroom.find({ room_id: ids.room })
  result.room.push(...rooms)
  const lives = await ShowroomLog.find({ data_id: ids.live })
    .select({
      live_info: {
        duration: 1,
        viewers: 1,
        start_date: 1,
        end_date: 1,
      },
      data_id: 1,
      total_point: 1,
      created_at: 1,
      room_id: 1,
      room_info: 1,
    })
    .populate({
      path: 'room_info',
      select: '-_id name img url -room_id member_data is_group',
      populate: {
        path: 'member_data',
        select: '-_id isGraduate img',
      },
    })
    .lean()

  const data = lives.map<IRecent>(i => ({
    _id: i._id,
    data_id: i.data_id,
    member: {
      name: i.room_info?.name ?? 'Member not Found!',
      img_alt: i.room_info?.member_data?.img ?? i.room_info?.img ?? config.errorPicture,
      img: i.room_info?.img ?? config.errorPicture,
      url: i.room_info?.url ?? '',
      is_graduate: i.room_info?.is_group ? false : (i.room_info?.member_data?.isGraduate ?? i.room_id === 332503),
      is_official: i.room_info?.is_group ?? false,
    },
    created_at: i.created_at.toISOString(),
    live_info: {
      comments: i.live_info?.comments ?? undefined,
      duration: Number(i.live_info?.duration ?? 0),
      viewers: {
        num: i.live_info.viewers?.peak ?? 0,
        active: i.live_info.viewers?.active ?? 0,
        is_excitement: i.live_info.viewers?.is_excitement ?? false,
      },
      date: {
        start: i.live_info.start_date.toISOString(),
        end: i.live_info.end_date.toISOString(),
      },
    },
    room_id: i.room_id,
    points: i.total_point,
  })).sort((a, b) => {
    return ids.live.indexOf(a.data_id) - ids.live.indexOf(b.data_id)
  })

  result.live.push(...data)

  return result
}

export default model<Database.ILiked, ILikedModel>('Liked', LikedSchema)
