import { Schema, model } from 'mongoose'

export default model<I48Member>(
  'Member',
  new Schema<I48Member>({
    name: {
      type: String,
      required: true,
    },
    kanji: {
      type: String,
    },
    isGraduate: {
      type: Boolean,
      required: true,
    },
    group: {
      type: String,
    },
    description: {
      type: String,
    },
    img: {
      type: String,
    },
    stage48: {
      type: String,
    },
  }),
)
