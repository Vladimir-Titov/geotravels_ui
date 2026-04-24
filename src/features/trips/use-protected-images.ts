import { useEffect, useRef, useState } from 'react'
import { requestBlob } from '../../shared/api/http'

interface ProtectedImageSource {
    id: string
    url: string | null
}

interface ProtectedImageEntry {
    source: string
    objectUrl: string
}

const canCreateObjectUrl =
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function'

export const useProtectedImages = (
    sources: ProtectedImageSource[],
): Record<string, ProtectedImageEntry> => {
    const entriesRef = useRef<Record<string, ProtectedImageEntry>>({})
    const [entries, setEntries] = useState<Record<string, ProtectedImageEntry>>({})

    useEffect(() => {
        if (!canCreateObjectUrl) {
            return
        }

        const activeSources = new Map(sources.map((source) => [source.id, source.url]))
        Object.entries(entriesRef.current).forEach(([id, entry]) => {
            if (activeSources.get(id) !== entry.source) {
                URL.revokeObjectURL(entry.objectUrl)
                delete entriesRef.current[id]
            }
        })

        let isCancelled = false

        const loadImages = async () => {
            for (const source of sources) {
                if (!source.url || entriesRef.current[source.id]?.source === source.url) {
                    continue
                }

                try {
                    const blob = await requestBlob(source.url)
                    if (isCancelled) {
                        return
                    }

                    const objectUrl = URL.createObjectURL(blob)
                    const previous = entriesRef.current[source.id]
                    if (previous) {
                        URL.revokeObjectURL(previous.objectUrl)
                    }

                    entriesRef.current[source.id] = {
                        source: source.url,
                        objectUrl,
                    }
                    setEntries({ ...entriesRef.current })
                } catch {
                    // Keep the neutral fallback when an image cannot be loaded.
                }
            }
        }

        void loadImages()

        return () => {
            isCancelled = true
        }
    }, [sources])

    useEffect(() => {
        return () => {
            if (!canCreateObjectUrl) {
                return
            }

            Object.values(entriesRef.current).forEach((entry) => {
                URL.revokeObjectURL(entry.objectUrl)
            })
            entriesRef.current = {}
        }
    }, [])

    return entries
}
