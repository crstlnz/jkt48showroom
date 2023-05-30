import { Schema, model } from 'mongoose'

interface IConfig {
  configname: string
  value: any
}

export default model<IConfig>(
  'Config',
  new Schema<IConfig>({
    configname: {
      type: String,
      required: true,
      unique: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
  }),
)
