import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from 'react'
import { useTranslation } from 'react-i18next'
import { USE_DASHBOARD_MOCK } from '../../shared/config/env'
import type { MyTravelsDashboardResponse } from '../../shared/api/types'
import { fetchMyTravelsDashboard } from './my-travels-api'
import { mockMyTravelsDashboard } from './my-travels-mock'
import { isMyTravelsDashboardEmpty, normalizeMyTravelsDashboard } from './my-travels-normalize'

interface MyTravelsDashboardState {
    data: MyTravelsDashboardResponse | null
    isLoading: boolean
    error: string | null
    isEmpty: boolean
    refetch: () => Promise<void>
}

const MyTravelsDashboardContext = createContext<MyTravelsDashboardState | null>(null)

const useMyTravelsDashboardSource = (): MyTravelsDashboardState => {
    const { t } = useTranslation('myTravels')
    const [data, setData] = useState<MyTravelsDashboardResponse | null>(null)
    const [isLoading, setIsLoading] = useState<boolean>(true)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            const dashboard = USE_DASHBOARD_MOCK
                ? normalizeMyTravelsDashboard(mockMyTravelsDashboard)
                : await fetchMyTravelsDashboard()

            setData(dashboard)
        } catch (requestError) {
            setData(null)
            if (requestError instanceof Error && requestError.message.trim().length > 0) {
                setError(requestError.message)
            } else {
                setError(t('loadError'))
            }
        } finally {
            setIsLoading(false)
        }
    }, [t])

    useEffect(() => {
        void refetch()
    }, [refetch])

    const isEmpty = useMemo(() => (data ? isMyTravelsDashboardEmpty(data) : false), [data])

    return {
        data,
        isLoading,
        error,
        isEmpty,
        refetch,
    }
}

export const MyTravelsDashboardProvider = ({ children }: PropsWithChildren) => {
    const value = useMyTravelsDashboardSource()

    return (
        <MyTravelsDashboardContext.Provider value={value}>
            {children}
        </MyTravelsDashboardContext.Provider>
    )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useMyTravelsDashboard = (): MyTravelsDashboardState => {
    const context = useContext(MyTravelsDashboardContext)

    if (!context) {
        throw new Error('useMyTravelsDashboard must be used within MyTravelsDashboardProvider')
    }

    return context
}
