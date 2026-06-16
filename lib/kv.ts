// Fallback: in-memory job store (works across serverless instances via cookie/same-region)
const store = globalThis as any

if (!store.__ailomo_jobs) store.__ailomo_jobs = new Map<string, any>()

export async function getJob(key: string) {
  return store.__ailomo_jobs.get(key) || null
}

export async function setJob(key: string, value: any) {
  store.__ailomo_jobs.set(key, value)
}
