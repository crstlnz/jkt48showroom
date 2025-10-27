/* eslint-disable no-unused-vars */

declare namespace ImageTypes {
  enum Provider {
    CLOUDINARY = 'cloudinary',
    IMAGEKIT = 'imagekit',
    URL = 'url',
  }

  interface Hosted {
    id: string
    name: string
    url: string
    path: string
    provider: string
  }
}
