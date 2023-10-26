import { Schema } from 'mongoose'
import { connection } from '..'
import Song from './Song'

const eventSchema = new Schema<JKT48.Setlist>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  title: String,
  title_alt: String,
  description: String,
  poster: String,
  banner: String,
  gallery: {
    type: [String],
    default: [],
  },
  songs: [{ type: Schema.Types.ObjectId, ref: Song }],
})

export default connection.model<JKT48.Setlist>(
  'JKT48Setlist',
  eventSchema,
)
