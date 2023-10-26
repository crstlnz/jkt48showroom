import { Schema } from 'mongoose'
import { connection } from '..'

const eventSchema = new Schema<JKT48.News>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  label: String,
  title: String,
  content: String,
  url: String,
  date: Date,
})

// memberSchema.virtual('showroom', {
//   ref: 'Showroom',
//   localField: 'showroom_id',
//   foreignField: 'room_id',
//   justOne: true
// })

export default connection.model<JKT48.News>(
  'JKT48News',
  eventSchema,
)
