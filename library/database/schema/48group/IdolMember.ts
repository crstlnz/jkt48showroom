// import type { ReadStream } from 'fs'
// import type { Model, Types } from 'mongoose'
// import { Schema, model } from 'mongoose'
// import Image from '../others/images'
// import { upload } from '../../../utils/imageUploader'
// import { isValidURL } from '../../../utils'

// type InsertType = 'image' | 'image_alt'
// interface IMemberMethods {
//   upload: (data: string | Buffer | ReadStream, insert?: InsertType) => Promise<void>
// }

// type MemberModel = Model<IMember4648, {}, IMemberMethods>

// const schema = new Schema<IMember4648, MemberModel, IMemberMethods>({
//   name: {
//     type: String,
//     required: true
//   },
//   image: { type: Schema.Types.ObjectId, ref: Image },
//   image_alt: { type: Schema.Types.ObjectId, ref: Image },
//   images: {
//     type: [
//       {
//         _id: false,
//         image: { type: Schema.Types.ObjectId, ref: Image },
//         date: {
//           type: Date,
//           default: Date.now
//         }
//       }
//     ],
//     default: []
//   },
//   stage48: {
//     type: String
//   },
//   isGraduate: {
//     type: Boolean,
//     required: true
//   },
//   group: {
//     required: true,
//     type: String
//   },
//   description: {
//     type: String
//   },
//   showroom: {
//     type: {
//       name: String,
//       url: String,
//       img: String,
//       img_square: String,
//       room_id: Number,
//       room_exists: Boolean,
//       is_active: Boolean
//     },
//     required: false
//   }
// })

// schema.method('upload', async function (data: string | Buffer | ReadStream, insert?: InsertType) {
//   const name = this.name.replace(/[.*+?^${}()|[\]\\/]/g, ' ').replace(/\p{Emoji}/gu, '')
//   const response = await upload(data, { folder: name === '_' ? '/images/member/' : `/images/member/${name}/`, fileName: Date.now().toString(), useUniqueFileName: false }).catch((e) => {
//     console.log(e)
//     return null
//   })

//   if (response == null) {
//     if (typeof data !== 'string' || !isValidURL(data)) throw new Error('Upload error and given data is not url!')
//     else console.error(`Upload ${this.name} image error!`)
//   }

//   const opts = response == null
//     ? {
//         id: data,
//         name: data,
//         url: data,
//         path: data,
//         provider: ImageProvider.URL
//       }
//     : {
//         id: response.fileId,
//         name: response.name,
//         url: response.url,
//         path: response.filePath,
//         provider: ImageProvider.IMAGEKIT
//       }

//   const image = await new Image(opts).save()
//   if (!this.images) this.images = []
//   this.images.push({
//     image: image._id,
//     date: new Date()
//   })
//   if (!this.image) this.image = image._id
//   if (!this.image_alt) this.image_alt = image._id

//   if (insert === 'image_alt') {
//     this.image_alt = image._id
//   } else if (insert === 'image') {
//     this.image = image._id
//   }
//   await this.save()
// })

// export default model<IMember4648, MemberModel>('IdolMember', schema)
