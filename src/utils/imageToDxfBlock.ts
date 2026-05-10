import type { DxfSolidCell } from '@/types/map'

const rgbToAcadColor = (r: number, g: number, b: number) => {
  if (r > 220 && g > 220 && b > 220) return 7
  if (r < 50 && g < 50 && b < 50) return 8

  if (r > 180 && g < 120 && b < 120) return 1
  if (r > 180 && g > 150 && b < 120) return 2
  if (g > 160 && r < 140 && b < 140) return 3
  if (g > 150 && b > 150 && r < 140) return 4
  if (b > 160 && r < 140 && g < 140) return 5
  if (r > 150 && b > 150 && g < 140) return 6

  return 8
}

const sanitizeBlockName = (value: string) => {
  const clean = value.replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase()
  return `ICON_${clean || 'MARKER'}`
}

export const imageFileToDxfCells = async (
  file: File,
  options?: {
    size?: number
    alphaThreshold?: number
    sampleStep?: number
    maxCells?: number
  }
): Promise<DxfSolidCell[]> => {
  const size = options?.size ?? 16
  const alphaThreshold = options?.alphaThreshold ?? 40
  const sampleStep = options?.sampleStep ?? 2
  const maxCells = options?.maxCells ?? 80

  const objectUrl = URL.createObjectURL(file)

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = objectUrl
    })

    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    if (!ctx) return []

    ctx.clearRect(0, 0, size, size)
    ctx.drawImage(image, 0, 0, size, size)

    const imageData = ctx.getImageData(0, 0, size, size)
    const cells: DxfSolidCell[] = []

    for (let y = 0; y < size; y += sampleStep) {
      for (let x = 0; x < size; x += sampleStep) {
        const index = (y * size + x) * 4

        const r = imageData.data[index]
        const g = imageData.data[index + 1]
        const b = imageData.data[index + 2]
        const a = imageData.data[index + 3]

        if (a <= alphaThreshold) continue

        cells.push({
          x: x - size / 2,
          y: size / 2 - y,
          size: sampleStep,
          color: rgbToAcadColor(r, g, b),
        })
      }
    }

    if (cells.length <= maxCells) {
      return cells
    }

    const step = Math.ceil(cells.length / maxCells)
    return cells.filter((_, index) => index % step === 0)
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}

export const createDxfBlockNameFromPrefix = sanitizeBlockName