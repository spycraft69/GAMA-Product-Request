import fs from 'fs'
import path from 'path'

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-z0-9.\-]/gi, '_')
}

export async function saveFile(file: File, folder: 'logos' | 'products') {
  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const uploadsDir = path.join(process.cwd(), 'public', 'uploads', folder)
  await fs.promises.mkdir(uploadsDir, { recursive: true })

  const sanitizedName = sanitizeFileName(file.name)
  const uniqueName = `${Date.now()}_${sanitizedName}`
  const filePath = path.join(uploadsDir, uniqueName)

  await fs.promises.writeFile(filePath, buffer)

  return `/uploads/${folder}/${uniqueName}`
}
