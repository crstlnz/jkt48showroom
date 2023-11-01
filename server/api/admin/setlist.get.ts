import Setlist from '~/library/database/showroomDB/jkt48/Setlist'
import cache from '~~/library/utils/cache'

const time = 1000

export default defineEventHandler(async (): Promise<JKT48.Setlist[]> => {
  return await cache.fetch<JKT48.Setlist[]>('setlist-theater', fetchData, time).catch(() => [])
})

async function fetchData() {
  try {
    const setlists = await Setlist.find({}).populate('songs').lean()
      .lean()
    return setlists
  }
  catch (e) {
    console.log(e)
    return []
  }
}
