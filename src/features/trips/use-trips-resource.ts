import { useCallback, useEffect, useState } from 'react'
import {
    fetchTripCards,
    fetchTripDetails,
    fetchTripStatistics,
} from './trips-api'
import type {
    TripCardsResponse,
    TripDetails,
    TripStatistics,
    VisibleTripStatus,
} from './trips-types'

interface ResourceState<T> {
    data: T | null
    isLoading: boolean
    error: string | null
    refetch: () => Promise<void>
}

const getErrorMessage = (error: unknown, fallback: string): string => {
    if (error instanceof Error && error.message.trim().length > 0) {
        return error.message
    }
    return fallback
}

const useResource = <T,>(loader: () => Promise<T>, fallbackError: string): ResourceState<T> => {
    const [data, setData] = useState<T | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refetch = useCallback(async () => {
        setIsLoading(true)
        setError(null)

        try {
            setData(await loader())
        } catch (requestError) {
            setData(null)
            setError(getErrorMessage(requestError, fallbackError))
        } finally {
            setIsLoading(false)
        }
    }, [fallbackError, loader])

    useEffect(() => {
        void refetch()
    }, [refetch])

    return { data, isLoading, error, refetch }
}

export const useTripCards = (status: VisibleTripStatus): ResourceState<TripCardsResponse> => {
    const loader = useCallback(() => fetchTripCards(status), [status])
    return useResource(loader, 'Unable to load trips')
}

export const useTripDetails = (visitId: string | undefined): ResourceState<TripDetails> => {
    const loader = useCallback(async () => {
        if (!visitId) {
            throw new Error('Trip is missing')
        }
        return fetchTripDetails(visitId)
    }, [visitId])

    return useResource(loader, 'Unable to load trip')
}

export const useTripStatistics = (): ResourceState<TripStatistics> => {
    const loader = useCallback(() => fetchTripStatistics(), [])
    return useResource(loader, 'Unable to load statistics')
}
