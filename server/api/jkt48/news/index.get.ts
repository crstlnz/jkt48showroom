import { dbConnect } from '~/library/database'
import News from '~/library/database/showroomDB/jkt48/News'
import cache from '~~/library/utils/cache'

const time = 60000

export default defineEventHandler(async (event): Promise<IApiNews> => {
  const query = getQuery(event)
  const page = Number(query.page) || 1
  return await cache
    .fetch<IApiNews>(`jkt48news-page-${page}`, async () => await getNews(page), time)
})

async function getNews(page = 1, perpage = 10): Promise<IApiNews> {
  const total = await News.count({})
  const maxPage = Math.ceil(total / perpage)
  if (page < 1) page = 1
  if (page > maxPage) page = maxPage
  await dbConnect(1)
  const news = await News.find({}).limit(10).skip((page - 1) * perpage).sort('-date').select('title date label id').lean()
  return {
    news,
    page,
    perpage,
    total_count: total,
  }
}

export { getNews }
