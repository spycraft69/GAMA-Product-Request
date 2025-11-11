import fs from 'fs'
import path from 'path'
import { put } from '@vercel/blob'

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9.\-]/gi, '_')
}

export async function saveFile(file: File, folder: 'logos' | 'products') {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  if (process.env.VERCEL) {
    const sanitizedName = sanitizeFileName(file.name)
    const blobName = `${folder}/${Date.now()}_${sanitizedName}`
    const blob = await put(blobName, buffer, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type,
    })
    return blob.url
  }

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder)
  await fs.promises.mkdir(uploadsDir, { recursive: true })

  const sanitizedName = sanitizeFileName(file.name)
  const uniqueName = `${Date.now()}_${sanitizedName}`
  const filePath = path.join(uploadsDir, uniqueName)

  await fs.promises.writeFile(filePath, buffer)

  return `/uploads/${folder}/${uniqueName}`
}
