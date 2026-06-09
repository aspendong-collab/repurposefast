/**
 * Download utility — always proxies through our API to avoid
 * cross-origin issues with TikTok CDN URLs.
 */

export interface DownloadProgress {
    loaded: number
    total: number
    percent: number
}

export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * Download a file via the server proxy with progress (when supported) and
 * a custom save-as filename.
 */
export async function downloadWithProgress(
    url: string,
    filename: string,
    onProgress?: ProgressCallback
): Promise<void> {
    const proxyUrl = `/api/download?url=${encodeURIComponent(url)}&name=${encodeURIComponent(filename)}`

    // Try fetching through our proxy (same-origin = no CORS issues).
    // The proxy returns the file bytes + Content-Disposition: attachment.
    try {
        const response = await fetch(proxyUrl)
        if (!response.ok) {
            throw new Error(`Proxy returned ${response.status}`)
        }

        // If the browser supports streaming, track progress
        const contentLength = response.headers.get("content-length")
        const total = contentLength ? parseInt(contentLength, 10) : 0

        const blob = await response.blob()
        triggerDownload(blob, filename)

        // Fire a 100% progress event (we can't get incremental progress
        // from response.blob() but this keeps the API consistent)
        if (onProgress) {
            onProgress({ loaded: total || blob.size, total: total || blob.size, percent: 100 })
        }
    } catch {
        // Absolute fallback: open the proxy URL directly
        const a = document.createElement("a")
        a.href = proxyUrl
        a.download = filename
        a.style.display = "none"
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }
}

/**
 * Trigger browser download with a blob.
 */
function triggerDownload(blob: Blob, filename: string): void {
    const blobUrl = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = blobUrl
    a.download = filename
    a.style.display = "none"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(blobUrl)
}

/**
 * Generate descriptive filename.
 */
export function generateFilename(
    type: "video" | "audio" | "image",
    creator?: string,
    index?: number
): string {
    const timestamp = Date.now()
    const creatorSlug = creator
        ? creator.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 20)
        : "tiktok"

    const extensions: Record<string, string> = {
        video: "mp4",
        audio: "mp3",
        image: "jpg",
    }

    const extension = extensions[type] || "mp4"
    const indexSuffix = index !== undefined ? `_${index + 1}` : ""

    return `Saveik_${creatorSlug}${indexSuffix}_${timestamp}.${extension}`
}

/**
 * Format file size for display.
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
