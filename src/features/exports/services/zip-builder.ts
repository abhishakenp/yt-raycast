import { Buffer } from 'node:buffer'

const crcTable = new Uint32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  return c >>> 0
})

function crc32(buffer: Buffer): number {
  let crc = 0xffffffff
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const dosDateTime = (date = new Date()) => {
  const year = Math.max(1980, date.getFullYear())
  return {
    dosTime:
      (date.getHours() << 11) |
      (date.getMinutes() << 5) |
      Math.floor(date.getSeconds() / 2),
    dosDate:
      ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  }
}

const ZIP_EPOCH = new Date(1980, 0, 1, 0, 0, 0)

const normalizeZipEntryPath = (path: string): string => {
  if (!path || path.includes('\0')) {
    throw new Error('Invalid ZIP entry path')
  }

  const portablePath = path.replaceAll('\\', '/').normalize('NFC')
  if (
    portablePath.startsWith('/') ||
    /^[a-z]:\//i.test(portablePath) ||
    portablePath.split('/').includes('..')
  ) {
    throw new Error(`Unsafe ZIP entry path: ${path}`)
  }

  const normalizedPath = portablePath
    .split('/')
    .filter((segment) => segment !== '' && segment !== '.')
    .join('/')
  if (!normalizedPath) {
    throw new Error('Invalid ZIP entry path')
  }
  return normalizedPath
}

export function createZipBuffer(
  files: Record<string, string | Buffer>,
): Buffer {
  const localParts: Buffer[] = []
  const centralParts: Buffer[] = []
  const entries = Object.entries(files)
    .map(([path, source]) => {
      const normalizedPath = normalizeZipEntryPath(path)
      return {
        path: normalizedPath,
        portableKey: normalizedPath.toLocaleLowerCase('en-US'),
        source,
      }
    })
    .sort((left, right) => left.portableKey.localeCompare(right.portableKey))
  const duplicate = entries.find(
    (entry, index) =>
      index > 0 && entry.portableKey === entries[index - 1]?.portableKey,
  )
  if (duplicate) {
    throw new Error(`Duplicate ZIP entry path: ${duplicate.path}`)
  }

  let offset = 0
  const { dosDate, dosTime } = dosDateTime(ZIP_EPOCH)

  for (const { path, source } of entries) {
    const filename = Buffer.from(path)
    const content = Buffer.isBuffer(source)
      ? source
      : Buffer.from(String(source), 'utf-8')
    const crc = crc32(content)

    const localHeader = Buffer.alloc(30)
    localHeader.writeUInt32LE(0x04034b50, 0)
    localHeader.writeUInt16LE(20, 4)
    localHeader.writeUInt16LE(0x0800, 6)
    localHeader.writeUInt16LE(0, 8)
    localHeader.writeUInt16LE(dosTime, 10)
    localHeader.writeUInt16LE(dosDate, 12)
    localHeader.writeUInt32LE(crc, 14)
    localHeader.writeUInt32LE(content.length, 18)
    localHeader.writeUInt32LE(content.length, 22)
    localHeader.writeUInt16LE(filename.length, 26)
    localHeader.writeUInt16LE(0, 28)
    localParts.push(localHeader, filename, content)

    const centralHeader = Buffer.alloc(46)
    centralHeader.writeUInt32LE(0x02014b50, 0)
    centralHeader.writeUInt16LE(20, 4)
    centralHeader.writeUInt16LE(20, 6)
    centralHeader.writeUInt16LE(0x0800, 8)
    centralHeader.writeUInt16LE(0, 10)
    centralHeader.writeUInt16LE(dosTime, 12)
    centralHeader.writeUInt16LE(dosDate, 14)
    centralHeader.writeUInt32LE(crc, 16)
    centralHeader.writeUInt32LE(content.length, 20)
    centralHeader.writeUInt32LE(content.length, 24)
    centralHeader.writeUInt16LE(filename.length, 28)
    centralHeader.writeUInt16LE(0, 30)
    centralHeader.writeUInt16LE(0, 32)
    centralHeader.writeUInt16LE(0, 34)
    centralHeader.writeUInt16LE(0, 36)
    centralHeader.writeUInt32LE(0, 38)
    centralHeader.writeUInt32LE(offset, 42)
    centralParts.push(centralHeader, filename)

    offset += localHeader.length + filename.length + content.length
  }

  const centralDirectory = Buffer.concat(centralParts)
  const localDirectory = Buffer.concat(localParts)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(0, 4)
  end.writeUInt16LE(0, 6)
  end.writeUInt16LE(entries.length, 8)
  end.writeUInt16LE(entries.length, 10)
  end.writeUInt32LE(centralDirectory.length, 12)
  end.writeUInt32LE(localDirectory.length, 16)
  end.writeUInt16LE(0, 20)

  return Buffer.concat([localDirectory, centralDirectory, end])
}
