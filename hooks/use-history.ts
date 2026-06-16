'use client'

import { useState, useEffect, useCallback } from 'react'

export interface HistoryItem {
  id: string
  url: string
  title: string
  transcript: string
  formats: { format: string; title: string; content: string }[]
  createdAt: number
  language: string
}

const STORAGE_KEY = 'ailomo_history'
const MAX_ITEMS = 50

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {}
    setMounted(true)
  }, [])

  const save = useCallback((newItems: HistoryItem[]) => {
    setItems(newItems)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newItems.slice(0, MAX_ITEMS)))
    } catch {}
  }, [])

  const addItem = useCallback((item: Omit<HistoryItem, 'id' | 'createdAt'>) => {
    const newItem: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    }
    save([newItem, ...items])
  }, [items, save])

  const removeItem = useCallback((id: string) => {
    save(items.filter((i) => i.id !== id))
  }, [items, save])

  const clearAll = useCallback(() => {
    save([])
    localStorage.removeItem(STORAGE_KEY)
  }, [save])

  return { items, addItem, removeItem, clearAll, mounted }
}
