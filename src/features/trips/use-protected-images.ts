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

const MAX_PARALLEL_IMAGE_LOADS = 4
const imageBlobCache = new Map<string, Blob>()

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
        const abortController = new AbortController()

        const loadImage = async (source: ProtectedImageSource): Promise<void> => {
            if (!source.url || entriesRef.current[source.id]?.source === source.url) {
                return
            }

            try {
                const cachedBlob = imageBlobCache.get(source.url)
                const blob = cachedBlob ?? (await requestBlob(source.url, { signal: abortController.signal }))
                if (!cachedBlob) {
                    imageBlobCache.set(source.url, blob)
                }
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

        const loadImages = async () => {
            const pendingSources = sources.filter(
                (source) => source.url && entriesRef.current[source.id]?.source !== source.url,
            )
            let nextIndex = 0
            const workerCount = Math.min(MAX_PARALLEL_IMAGE_LOADS, pendingSources.length)
            const workers = Array.from({ length: workerCount }, async () => {
                while (!isCancelled) {
                    const source = pendingSources[nextIndex]
                    nextIndex += 1
                    if (!source) {
                        return
                    }
                    await loadImage(source)
                }
            })

            await Promise.all(workers)
        }

        void loadImages()

        return () => {
            isCancelled = true
            abortController.abort()
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
