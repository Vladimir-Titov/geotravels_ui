import { requestJson } from '../../shared/api/http'
import type { MyTravelsDashboardResponse } from '../../shared/api/types'
import { mockMyTravelsDashboard } from './my-travels-mock'

const DASHBOARD_ENDPOINT = '/api/v1/dashboard/my-travels'

export const fetchMyTravelsDashboard = async (): Promise<MyTravelsDashboardResponse> => {
    try {
        return await requestJson<MyTravelsDashboardResponse>(DASHBOARD_ENDPOINT)
    } catch {
        return mockMyTravelsDashboard
    }
}
