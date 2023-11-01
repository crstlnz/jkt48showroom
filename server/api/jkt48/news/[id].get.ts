import News from '~/library/database/showroomDB/jkt48/News'
import cache from '~~/library/utils/cache'

// const time = 1
const time = 60000 * 5

export default defineEventHandler(async (event): Promise<JKT48.News> => {
  const id = event.context.params?.id ?? '0'
  return await cache
    .fetch<JKT48.News>(`jkt48news-${id}`, async () => await getNews(id), time)
})

async function getNews(id: string): Promise<JKT48.News> {
  return await News.findOne({ id }).orFail().select('title date label id content').lean()
}

export { getNews }
