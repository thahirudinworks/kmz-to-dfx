export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // body bisa berupa string atau object tergantung Content-Type
  const body =
    typeof req.body === 'string'
      ? req.body
      : typeof req.body === 'object' && req.body !== null
        ? JSON.stringify(req.body)
        : String(req.body ?? '')

  const ENDPOINTS = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.openstreetmap.ru/api/interpreter',
  ]

  let lastError = 'Unknown error'

  for (const endpoint of ENDPOINTS) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body,
        headers: {
          'Content-Type': 'text/plain',
          'User-Agent': 'gis-hier-app/1.0',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      res.setHeader('Content-Type', 'application/json')
      return res.status(200).json(data)
    } catch (err) {
      lastError = String(err)
    }
  }

  return res
    .status(502)
    .json({ error: 'All Overpass endpoints failed', detail: lastError })
}
