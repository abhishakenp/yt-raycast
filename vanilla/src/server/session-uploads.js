import { randomUUID } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

export const USER_UPLOAD_SUBDIR = 'user-uploads'
const MAX_BYTES = 4 * 1024 * 1024

const extForMime = (mimetype = '') => {
  const m = String(mimetype).toLowerCase()
  if (m === 'image/jpeg') return '.jpg'
  if (m === 'image/png') return '.png'
  if (m === 'image/webp') return '.webp'
  if (m === 'image/gif') return '.gif'
  return null
}

export const saveSessionImageBuffers = (workspace, fileList = []) => {
  const dir = join(workspace, USER_UPLOAD_SUBDIR)
  mkdirSync(dir, { recursive: true })
  const out = []
  for (const file of fileList) {
    if (!file?.buffer || !Buffer.isBuffer(file.buffer)) continue
    if (file.buffer.length > MAX_BYTES) continue
    const ext = extForMime(file.mimetype)
    if (!ext) continue
    const base = randomUUID().replace(/-/g, '')
    const filename = `${base}${ext}`
    const rel = `${USER_UPLOAD_SUBDIR}/${filename}`
    writeFileSync(join(workspace, rel), file.buffer)
    out.push({
      path: rel,
      originalName: typeof file.originalname === 'string' ? file.originalname : filename,
    })
  }
  return out
}

export const MAX_UPLOAD_BYTES = MAX_BYTES
