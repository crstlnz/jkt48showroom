/* eslint-disable no-console */
import dotenv from 'dotenv'
import { schedule } from 'node-cron'
import database from '../../library/database'
import { getStats } from '../api/showroom/stats.get'

export default defineNitroPlugin(async () => {
  console.log('Init')
  dotenv.config()
})
