import { requestJson } from '../../shared/api/http'
import type { MyTravelsDashboardResponse } from '../../shared/api/types'
import { normalizeMyTravelsDashboard } from './my-travels-normalize'

const DASHBOARD_ENDPOINT = '/api/v1/dashboard/my-travels'

export const fetchMyTravelsDashboard = async (): Promise<MyTravelsDashboardResponse> => {
    const response = await requestJson<unknown>(DASHBOARD_ENDPOINT)
    return normalizeMyTravelsDashboard(response)
}
