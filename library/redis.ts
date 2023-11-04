/* eslint-disable no-console */
import dotenv from 'dotenv'
import { createClient } from 'redis'

dotenv.config()

const client = createClient({
  url: process.env.REDIS_URI,
})

client.on('error', err => console.log('Redis Client Error', err))
client.on('connect', () => console.log('Connected to Redis'))
export function connect() {
  client.connect()
}

export default client
