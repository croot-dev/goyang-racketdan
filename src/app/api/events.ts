import { NextApiRequest, NextApiResponse } from 'next'

const events: any[] = [] // 임시 DB

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.status(200).json(events)
  } else if (req.method === 'POST') {
    const newEvent = JSON.parse(req.body)
    events.push(newEvent)
    res.status(201).json(newEvent)
  } else {
    res.status(405).end()
  }
}
