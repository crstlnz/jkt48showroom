import { Schema } from 'mongoose'
import { connection } from '..'
import Member from './Member'
import Setlist from './Setlist'

const theaterSchema = new Schema<JKT48.Theater>({
  id: {
    unique: true,
    required: true,
    type: String,
  },
  title: {
    type: String,
    default: '',
  },
  url: {
    type: String,
    default: '',
  },
  memberIds: {
    type: [Number],
    default: [],
  },
  seitansaiIds: {
    type: [Number],
    default: [],
  },
  date: {
    type: Date,
    required: true,
  },
  team: {
    id: String,
    img: String,
  },
})

theaterSchema.virtual('members', {
  ref: Member,
  localField: 'memberIds',
  foreignField: 'id',
})

theaterSchema.virtual('setlist', {
  ref: Setlist,
  localField: 'setlistId',
  foreignField: 'id',
  justOne: true,
})

theaterSchema.virtual('seitansai', {
  ref: Member,
  localField: 'seitansaiIds',
  foreignField: 'id',
})

export default connection.model<JKT48.Theater>(
  'JKT48Theater',
  theaterSchema,
)
