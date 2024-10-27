/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable no-unused-vars */
enum ImageProvider {
  CLOUDINARY = 'cloudinary',
  IMAGEKIT = 'imagekit',
  URL = 'url',
}

interface HostedImage {
  id: string
  name: string
  url: string
  path: string
  provider: string
}
