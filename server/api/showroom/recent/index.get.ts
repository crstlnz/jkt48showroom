/* eslint-disable no-unused-vars */
import Fuse from 'fuse.js'
import { getMembers } from '../members.get'
import ShowroomLog from '~~/library/database/schema/showroom/ShowroomLog'
import config from '~~/app.config'
export default defineEventHandler(async (event): Promise<IApiRecents> => await getRecents(getQuery(event)))
export { getRecents }

// const group = ['jkt48', 'hinatazaka46'].includes(config.group ?? 'all') ? config.group : 'all'
async function getRecents (qq: any = null): Promise<IApiRecents> {
  let page = 1
  const perpage = 10
  const query: RecentsQuery = qq ?? {}
  if (query.page) page = Number(query.page) ?? 1
  if (page < 1) page = 1
  enum sortType {
    LATEST,
    OLDEST,
    MOST_GIFT,
    MOST_VIEWS,
  }
  const sort = sortType[String(query.sort)?.toUpperCase()] ?? sortType.LATEST
  function getSort (sort: sortType): string {
    switch (sort) {
      case sortType.LATEST:
        return '-live_info.end_date'
      case sortType.OLDEST:
        return 'live_info.end_date'
      case sortType.MOST_GIFT:
        return '-total_point'
      case sortType.MOST_VIEWS:
        return '-live_info.penonton.peak'
      default:
        return '-live_info.end_date'
    }
  }

  let members = await getMembers()
  let logs = [] as any[]
  let total = 0

  const search = query.search ? String(query.search) ?? '' : ''
  if (search !== '') {
    const fuse = new Fuse(members, {
      threshold: 0.2,
      keys: [
        { name: 'name', weight: 0.4 },
        { name: 'member_data.name', weight: 0.4 },
        { name: 'description', weight: 0.2 }
      ]
    })
    members = fuse.search(search).map(i => i.item)
  }

  const q = query.filter
  if (q === 'graduated' || q === 'active') {
    members = members.filter((i) => {
      return i.is_graduate === (q === 'graduated')
    })
  }

  type Options = {
    room_id?: number[];
    is_dev?: boolean;
  };

  const options: Options = {}
  if (process.env.NODE_ENV !== 'development') { options.is_dev = false }
  if (members.length) {
    options.room_id = members.map(i => i.room_id)
    logs = await ShowroomLog.find(options)
      .select({
        live_info: {
          penonton: {
            peak: 1
          },
          start_date: 1,
          end_date: 1
        },
        data_id: 1,
        total_point: 1,
        created_at: 1,
        room_id: 1,
        room_info: 1
      })
      .sort(getSort(sort))
      .skip((page - 1) * perpage)
      .limit(perpage)
      // .populate({
      //   path: 'room_info',
      //   // select: '-_id name image url -room_id',
      //   populate: [
      //     {
      //       path: 'image'
      //       // select: '-_id url -date'
      //     },
      //     {
      //       path: 'image_alt'
      //       // select: '-_id url -date'
      //     }
      //   ]
      // })
      .populate({
        path: 'room_info',
        select: '-_id name img url -room_id member_data',
        populate: {
          path: 'member_data',
          select: '-_id isGraduate img'
        }
      })
      .lean()
  }

  total = await ShowroomLog.count(options)
  return {
    recents: logs.map<IRecent>(i => ({
      data_id: i.data_id,
      member: {
        name: i.room_info?.name ?? 'Member not Found!',
        // img: i.room_info?.image?.url ?? i.room_info?.image_alt?.url ?? config.errorPicture,
        // img_alt: i.room_info?.image_alt?.url ?? i.room_info?.image?.url ?? config.errorPicture,
        img_alt: i.room_info?.member_data?.img ?? i.room_info?.img ?? config.errorPicture,
        img: i.room_info?.img ?? config.errorPicture,
        url: i.room_info?.url ?? '',
        is_graduate: i.room_info?.member_data?.isGraduate ?? i.room_id === 332503
      },
      created_at: i.created_at.toISOString(),
      live_info: {
        viewers: i.live_info?.penonton?.peak ?? undefined,
        date: {
          start: i.live_info.start_date.toISOString(),
          end: i.live_info.end_date.toISOString()
        }
      },
      room_id: i.room_id,
      points: i.total_point
    })),
    page,
    perpage,
    total_count: total
  }
}
