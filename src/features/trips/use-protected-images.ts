import { useEffect, useRef, useState } from 'react'
import { requestBlob } from '../../shared/api/http'

interface ProtectedImageSource {
    id: string
    url: string | null
    fallbackUrl?: string | null
}

interface ProtectedImageEntry {
    source: string
    objectUrl: string
}

interface ProtectedImagesOptions {
    cacheBlobs?: boolean
}

const canCreateObjectUrl =
    typeof URL !== 'undefined' &&
    typeof URL.createObjectURL === 'function' &&
    typeof URL.revokeObjectURL === 'function'

const MAX_PARALLEL_IMAGE_LOADS = 4
const imageBlobCache = new Map<string, Blob>()

export const useProtectedImages = (
    sources: ProtectedImageSource[],
    options: ProtectedImagesOptions = {},
): Record<string, ProtectedImageEntry> => {
    const entriesRef = useRef<Record<string, ProtectedImageEntry>>({})
    const [entries, setEntries] = useState<Record<string, ProtectedImageEntry>>({})
    const cacheBlobs = options.cacheBlobs ?? true

    useEffect(() => {
        if (!canCreateObjectUrl) {
            return
        }

        const getSourceUrls = (source: ProtectedImageSource): string[] => {
            const urls = [source.url, source.fallbackUrl].filter(
                (url): url is string => typeof url === 'string' && url.length > 0,
            )
            return Array.from(new Set(urls))
        }

        const activeSources = new Map(sources.map((source) => [source.id, getSourceUrls(source).join('|')]))
        Object.entries(entriesRef.current).forEach(([id, entry]) => {
            if (activeSources.get(id) !== entry.source) {
                URL.revokeObjectURL(entry.objectUrl)
                delete entriesRef.current[id]
            }
        })

        let isCancelled = false
        const abortController = new AbortController()

        const loadImage = async (source: ProtectedImageSource): Promise<void> => {
            const sourceUrls = getSourceUrls(source)
            const sourceKey = sourceUrls.join('|')
            if (sourceUrls.length === 0 || entriesRef.current[source.id]?.source === sourceKey) {
                return
            }

            for (const url of sourceUrls) {
                try {
                    const cachedBlob = cacheBlobs ? imageBlobCache.get(url) : undefined
                    const blob = cachedBlob ?? (await requestBlob(url, { signal: abortController.signal }))
                    if (cacheBlobs && !cachedBlob) {
                        imageBlobCache.set(url, blob)
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
                        source: sourceKey,
                        objectUrl,
                    }
                    setEntries({ ...entriesRef.current })
                    return
                } catch {
                    // Try the next source URL before falling back to the neutral placeholder.
                }
            }
        }

        const loadImages = async () => {
            const pendingSources = sources.filter(
                (source) => {
                    const sourceKey = getSourceUrls(source).join('|')
                    return sourceKey && entriesRef.current[source.id]?.source !== sourceKey
                },
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
    }, [cacheBlobs, sources])

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
