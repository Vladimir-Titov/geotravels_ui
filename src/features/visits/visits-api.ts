import { requestJson } from '../../shared/api/http'
import type { MarkVisitRequest, VisitEvent, VisitsResponse } from '../../shared/api/types'

export const fetchVisits = async (): Promise<VisitsResponse> => {
  return requestJson<VisitsResponse>('/api/v1/visits')
}

export const createVisit = async (payload: MarkVisitRequest): Promise<VisitEvent> => {
  return requestJson<VisitEvent>('/api/v1/visits', {
    method: 'POST',
    body: payload,
  })
}
