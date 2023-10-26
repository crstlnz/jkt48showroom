import { Schema } from 'mongoose'
import { connection } from '..'

const memberSchema = new Schema<JKT48.Member>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  name: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
})

export default connection.model<JKT48.Member>(
  'JKT48Member',
  memberSchema,
)
