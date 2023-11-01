import Config from '../../library/database/schema/config/config'
import { dbConnect } from '~/library/database'

export default defineEventHandler(async (): Promise<number> => {
  return await getJapanRate()
})

async function getJapanRate(): Promise<number> {
  try {
    await dbConnect()
    const data = await Config.findOne({ configname: 'japan_rate' }).lean()
    return data?.value ?? 106.74
  }
  catch (e) {
    return 106.74
  }
}

export { getJapanRate }
