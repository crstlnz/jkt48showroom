import { getMembers } from './members.get'
import cache from '~~/library/utils/cache'
import ShowroomLog from '~~/library/database/schema/showroom/ShowroomLog'
import config from '~~/app.config'

const time = 60000 * 10
export default defineEventHandler(
  async (event) => {
    const query = getQuery(event)
    const group = config.getGroup(query.group as string)
    const cacheKey = group ? `${group}-records` : 'records'
    return await cache
      .fetch<ShowroomRecord[]>(cacheKey, () => fetchData(group), time)
  },
)

async function fetchData(group: string | null = null): Promise<ShowroomRecord[]> {
  const populatePath = {
    path: 'room_info',
    select: '-_id name img url -room_id member_data',
    populate: {
      path: 'member_data',
      select: '-_id name img',
    },
  }
  const members = await getMembers(group)
  const options: { is_dev: boolean; room_id?: number[] | number } = {
    is_dev: false,
  }
  if (members?.length) options.room_id = members.map(i => i.room_id)

  const mostViewer = await ShowroomLog.findOne(options).sort({ 'live_info.viewers.peak': -1 }).populate(populatePath).catch(_ => null)
  const longestDuration = await ShowroomLog.findOne(options).sort({ 'live_info.duration': -1 }).populate(populatePath).catch(_ => null)
  const mostGift = await ShowroomLog.findOne(options).sort({ total_point: -1 }).populate(populatePath).catch(_ => null)

  const records: ShowroomRecord[] = []
  if (mostViewer) {
    records.push({
      title: 'Most Viewer',
      data_id: mostViewer.data_id,
      key: 'mostviewer',
      name: mostViewer.room_info?.member_data?.name ?? mostViewer.room_info?.name ?? '',
      value: String(mostViewer.live_info.viewers?.peak ?? 0),
      date: mostViewer.created_at.toISOString(),
      img: mostViewer.room_info?.member_data?.img ?? mostViewer.room_info?.img ?? '',
      room_id: mostViewer.room_id ?? 0,
      url: `/member/${mostViewer.room_info?.url}`,
      parser: 'viewer',
    })
  }

  if (longestDuration) {
    records.push({
      title: 'Longest Live',
      data_id: longestDuration.data_id,
      key: 'longestlive',
      name: longestDuration.room_info?.member_data?.name ?? longestDuration.room_info?.name ?? '',
      value: String(longestDuration.live_info?.duration ?? 0),
      date: longestDuration.created_at.toISOString(),
      img: longestDuration.room_info?.member_data?.img ?? longestDuration.room_info?.img ?? '',
      room_id: longestDuration.room_id ?? 0,
      url: `/member/${longestDuration.room_info?.url}`,
      parser: 'duration',
    })
  }

  if (mostGift) {
    records.push({
      title: 'Most Gift',
      data_id: mostGift.data_id,
      key: 'mostgifts',
      name: mostGift.room_info?.member_data?.name ?? mostGift.room_info?.name ?? '',
      value: String(mostGift.total_point ?? 0),
      date: mostGift.created_at.toISOString(),
      img: mostGift.room_info?.member_data?.img ?? mostGift.room_info?.img ?? '',
      room_id: mostGift.room_id ?? 0,
      url: `/member/${mostGift.room_info?.url}`,
      parser: 'gift',
    })
  }
  return records ?? []
}
