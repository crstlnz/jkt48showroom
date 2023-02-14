import type { ReadStream } from 'fs'
import ImageKit from 'imagekit'
import type { UploadOptions } from 'imagekit/dist/libs/interfaces/UploadOptions'
export const imagekit = new ImageKit({
  publicKey: process.env.IMAGE_KIT_PUBLIC ?? '',
  privateKey: process.env.IMAGE_KIT_PRIVATE ?? '',
  urlEndpoint: process.env.IMAGE_KIT_URL ?? ''
})

function convertString (str: string) {
  return str.replace(/[^a-zA-Z0-9/_-]+/g, ' ').trim().replace(/\s+/g, '_')
}

export async function upload (data: string | Buffer | ReadStream, opts?: Partial<Omit<UploadOptions, 'file'>>) {
  if (opts?.folder) opts.folder = convertString(opts.folder)
  return await imagekit.upload({
    file: data,
    fileName: opts?.fileName ?? Date.now().toString(),
    ...opts
  })
}
