import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    default: '',
  },
  image: {
    type: String,
    default:
      'https://image.showroom-cdn.com/showroom-prod/assets/img/no_profile.jpg',
  },
  avatar_url: {
    type: String,
    default:
      'https://image.showroom-cdn.com/showroom-prod/image/avatar/1.png?v=87',
  },
  avatar_id: {
    type: Number,
    default: 1,
  },
  user_id: {
    type: Number,
    unique: true,
    required: true,
  },
  point: {
    type: Number,
    default: 0,
  },
  last_seen: {
    type: String,
  },
})

userSchema.index({ user_id: 1 }, { unique: true })
export default model('Showroom_User', userSchema)
