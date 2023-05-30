import { Schema, model } from 'mongoose'

enum ImageProviders {
  CLOUDINARY = 'cloudinary',
  IMAGEKIT = 'imagekit',
  URL = 'url',
}

export default model<HostedImage>('Image', new Schema<HostedImage>({
  id: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  path: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    enum: ImageProviders,
    required: true,
  },
}))
