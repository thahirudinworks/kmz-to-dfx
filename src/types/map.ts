export type MapType = 'satellite' | 'vector'

export type DxfSolidCell = {
  x: number
  y: number
  size: number
  color: number
}

export type MarkerIconRule = {
  namePrefix: string
  iconUrl: string
  dxfBlockName: string
  dxfCells: DxfSolidCell[]
}