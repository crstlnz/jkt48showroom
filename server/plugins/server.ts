/* eslint-disable no-console */
import dotenv from 'dotenv'
import database from '../../library/database'
export default defineNitroPlugin(async () => {
  console.log('Init')
  dotenv.config()
  database.run()
  await import('../../library/redis').then((redis) => {
    redis.default.connect()
  })
})
