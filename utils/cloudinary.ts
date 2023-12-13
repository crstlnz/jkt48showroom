import cloudinary from 'cloudinary'
import config from '../app.config'

export function uploadImage(image: any): Promise<any> {
  return new Promise<any>((resolve, reject) => {
    cloudinary.v2.uploader.upload(
      image,
      {
        folder: config.uploadFolder,
      },
      (error: any, result: any) => {
        if (error) {
          return reject(error)
        }
        else {
          return resolve(result)
        }
      },
    )
  })
}
