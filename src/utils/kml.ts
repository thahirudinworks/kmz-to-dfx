import JSZip from 'jszip'
import { kml } from '@tmcw/togeojson'

export const readKmlFromKmz = async (file: File) => {
  const bufferFile = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(bufferFile)

  const kmlFileName = Object.keys(zip.files).find((name) =>
    name.toLowerCase().endsWith('.kml')
  )

  if (!kmlFileName) {
    throw new Error('File KMZ tidak berisi file KML.')
  }

  return await zip.files[kmlFileName].async('text')
}

export const convertKmlTextToGeoJson = (text: string) => {
  const parser = new DOMParser()
  const kmlDocument = parser.parseFromString(text, 'text/xml')

  return kml(kmlDocument)
}