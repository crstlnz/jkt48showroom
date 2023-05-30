import { Schema } from 'mongoose'

export default {
  name: 'Showroom_Message',
  schema: new Schema({
    data_id: {
      type: String,
      required: true,
    },
    message_id: {
      type: String,
      required: true,
    },
    channel_id: {
      type: String,
      required: true,
    },
    bot_id: {
      type: String,
      required: true,
    },
  }),
}
