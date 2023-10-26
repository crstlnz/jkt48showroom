import { Schema } from 'mongoose'
import { connection } from '..'

const eventSchema = new Schema<JKT48.Song>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  title: String,
  title_jp: String,
  title_kanji: String,
  lyrics: String,
})

export default connection.model<JKT48.Song>(
  'JKT48Song',
  eventSchema,
)
