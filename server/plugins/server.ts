/* eslint-disable no-console */
import dotenv from 'dotenv'
import { schedule } from 'node-cron'
import database from '../../library/database'
import { getStats } from '../api/showroom/stats.get'
import { connection as ShowroomConnection } from '../../library/database/showroomDB'

export default defineNitroPlugin(async () => {
  console.log('Init')
  dotenv.config()
  database.run()
  ShowroomConnection.on('open', () => {
    console.log('Showroom DB Connected!')
  })

  schedule('0 0 * * *', () => { // run every 12:00 AM
    getStats()
  })

  await import('../../library/redis').then((redis) => {
    redis.default.connect()
  })
})
