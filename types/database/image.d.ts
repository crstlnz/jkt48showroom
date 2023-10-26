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
