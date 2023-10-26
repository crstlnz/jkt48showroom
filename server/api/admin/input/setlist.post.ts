import fs from 'fs'
import type { MultiPartData } from 'h3'
import Setlist from '~/library/database/showroomDB/jkt48/Setlist'
import { uploadImage } from '~/library/utils/cloudinary'

export default defineEventHandler(async (event): Promise<API.Status> => {
  const dataRaw = await readMultipartFormData(event)
  const data = new Map<string, MultiPartData>()
  for (const d of (dataRaw ?? [])) {
    data.set(d.name ?? 'undefined', d)
  }

  const poster = data.get('poster')?.data
  const banner = data.get('banner')?.data
  const origin_id = data.get('origin_id')?.data?.toString()
  const id = data.get('id')?.data?.toString()
  const title = data.get('title')?.data?.toString()
  const title_alt = data.get('title_alt')?.data?.toString()
  const description = data.get('description')?.data?.toString()

  if (!id || !title) throw createError({ statusCode: 400, statusMessage: 'Bad request!' })

  try {
    const dataJson: JKT48.Setlist = {
      id,
      title,
      title_alt,
      description,
    }

    if (poster) {
      const posterPath = './poster.jpg'
      fs.writeFileSync(posterPath, poster)
      const img = await uploadImage(posterPath)
      fs.unlinkSync(posterPath)
      const secure_url = img?.secure_url
      dataJson.poster = secure_url
    }

    if (banner) {
      const bannerPath = './banner.jpg'
      fs.writeFileSync(bannerPath, banner)
      const img = await uploadImage(bannerPath)
      fs.unlinkSync(bannerPath)
      const secure_url = img?.secure_url
      dataJson.poster = secure_url
    }

    await Setlist.updateOne(
      {
        id: origin_id ?? id,
      },
      {
        $set: dataJson,
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
        runValidators: true,
      },
    )

    return {
      code: 200,
      message: 'Success!',
    }
  }
  catch (e) {
    console.log(e)
    throw createError({ statusCode: 500, statusMessage: 'An error occured!' })
  }

  // const form = formidable()
  // // const { fields, files } = await form.parse(event.node.req)
  // return new Promise((resolve, reject) => {
  //   form.parse(event.node.req, (err, fields, files) => {
  //     if (err) {
  //       return reject(createError({ statusCode: 500, statusMessage: 'An error occured!' }))
  //     }

  //     return resolve({
  //       code: 200,
  //       message: 'Success!',
  //     })
  //   })
  // })
})
