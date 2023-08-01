import fs from 'fs'
import formidable from 'formidable'
import Member from '~~/library/database/schema/48group/Member'
import { uploadImage } from '~~/library/utils/cloudinary'

export default defineEventHandler(async (event): Promise<{
  url: string
  status: number
}> => {
  const form = formidable()
  return await new Promise((resolve, reject) => {
    form.parse(event.node.req, async (err, fields, files) => {
      if (err) {
        return reject(createError({ statusCode: 500, statusMessage: String(err) }))
      }

      try {
        if (!fields.id) return reject(createError({ statusCode: 400, statusMessage: 'Bad request!' }))
        if (!files.banner) return reject(createError({ statusCode: 400, statusMessage: 'Banner not included!' }))
        const member = await Member.findOne({ _id: fields.id })
        if (!member) return reject(createError({ statusCode: 400, statusMessage: 'Bad request!' }))
        const filePath = (files.banner as any).filepath
        const result = await uploadImage(filePath)
        fs.unlinkSync(filePath)
        member.banner = result.secure_url
        await member.save()
        return resolve({
          url: result.secure_url,
          status: 200,
        })
      }
      catch (e) {
        console.log(e)
        return reject(createError({ statusCode: 500, statusMessage: 'Something error!' }))
      }
    })
  })
})
