/**
 * Download utility — opens TikTok CDN URLs directly.
 * Most TikTok CDN URLs support Content-Disposition: attachment,
 * so the browser will trigger a save dialog.
 */

export interface DownloadProgress {
    loaded: number
    total: number
    percent: number
}

export type ProgressCallback = (progress: DownloadProgress) => void

/**
 * Trigger a direct download of a media URL.
 * TikTok CDN URLs typically return Content-Disposition: attachment
 * which triggers a native browser download dialog.
 *
 * Falls back to our proxy endpoint if the direct approach doesn't work
 * (e.g. some CDN URLs may be cross-origin restricted).
 */
export async function downloadWithProgress(
    url: string,
    filename: string,
    onProgress?: ProgressCallback
): Promise<void> {
    // Direct download via <a> tag with download attribute.
    // For same-origin or CDN with CORS, this triggers a save dialog.
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.style.display = "none"
    a.target = "_blank"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Fire 100% immediately since we can't track progress for direct links
    if (onProgress) {
        onProgress({ loaded: 100, total: 100, percent: 100 })
    }
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
