import { Schema } from 'mongoose'
import { connection } from '..'

const eventSchema = new Schema<JKT48.Schedule>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  label: String,
  title: String,
  url: String,
  date: Date,
})

export default connection.model<JKT48.Schedule>(
  'JKT48Schedule',
  eventSchema,
)
