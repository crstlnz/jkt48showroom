import type { Model } from 'mongoose'
import mongoose, { Schema } from 'mongoose'

const connection = mongoose.createConnection(process.env.MONGODB_URI_JKT48_SHOWROOM ?? '')

const stageListSchema = new Schema<Database.IStageListItem>({
  data_id: {
    type: String,
    unique: true,
  },
  stage_list: {
    type: [
      {
        _id: false,
        date: Date,
        list: [Number],
      },
    ],
    default: [],
  },
})

const StageList = connection.model('StageList', stageListSchema)
const database = connection.asPromise()
function convertDB<T>(model: Model<T>): Model<T> {
  return connection.model<T>(model.modelName, model.schema)
}
export { database, connection, StageList, convertDB }
