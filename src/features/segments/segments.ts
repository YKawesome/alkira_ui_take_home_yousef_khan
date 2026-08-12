import segmentsData from '@/data/segments.json'

export type Segment = {
  id: string
  name: string
  region: string
  enabled: boolean
}

export const INITIAL_SEGMENTS = segmentsData as Segment[]
