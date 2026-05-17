import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import type { Prompt } from '../types'
import { loadStore, saveStore } from '../storage'

const AUTOSAVE_MS = 450

function sortPrompts(list: Prompt[]): Prompt[] {
  return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
}

function mergeById(local: Prompt[], remote: Prompt[]): Prompt[] {
  const map = new Map<string, Prompt>()
  for (const p of local) map.set(p.id, p)
  for (const p of remote) {
    const ex = map.get(p.id)
    if (!ex || p.updatedAt >= ex.updatedAt) map.set(p.id, p)
  }
  return sortPrompts([...map.values()])
}

type StoreState = {
  prompts: Prompt[]
  activeId: string | null
  lastSavedAt: number | null
  saveError: string | null
}

function readInitial(): StoreState {
  const loaded = loadStore()
  if (loaded.prompts.length === 0) {
    const id = crypto.randomUUID()
    const seed: Prompt[] = [{ id, title: '', body: '', updatedAt: Date.now() }]
    try {
      saveStore({ prompts: seed, activeId: id })
      return { prompts: seed, activeId: id, lastSavedAt: Date.now(), saveError: null }
    } catch (e) {
      return {
        prompts: seed,
        activeId: id,
        lastSavedAt: null,
        saveError: e instanceof Error ? e.message : '无法写入本机存储',
      }
    }
  }

  const validActive =
    loaded.activeId && loaded.prompts.some((p) => p.id === loaded.activeId)
      ? loaded.activeId
      : loaded.prompts[0]?.id ?? null

  return {
    prompts: loaded.prompts,
    activeId: validActive,
    saveError: null,
    lastSavedAt: Date.now(),
  }
}

export function usePromptWorkbench() {
  const [{ prompts, activeId, lastSavedAt, saveError }, setStore] = useState<StoreState>(readInitial)

  const promptsRef = useRef(prompts)
  const activeIdRef = useRef(activeId)

  useLayoutEffect(() => {
    promptsRef.current = prompts
    activeIdRef.current = activeId
  }, [prompts, activeId])

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const persist = useCallback((nextPrompts: Prompt[], nextActiveId: string | null) => {
    try {
      saveStore({ prompts: nextPrompts, activeId: nextActiveId })
      setStore((s) => ({ ...s, saveError: null, lastSavedAt: Date.now() }))
    } catch (e) {
      setStore((s) => ({
        ...s,
        saveError: e instanceof Error ? e.message : '无法写入本机存储',
      }))
    }
  }, [])

  const flushPersist = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
      debounceRef.current = null
    }
    persist(promptsRef.current, activeIdRef.current)
  }, [persist])

  const schedulePersist = useCallback(
    (nextPrompts: Prompt[], nextActiveId: string | null) => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null
        persist(nextPrompts, nextActiveId)
      }, AUTOSAVE_MS)
    },
    [persist],
  )

  useLayoutEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    },
    [],
  )

  const sortedPrompts = useMemo(() => sortPrompts(prompts), [prompts])

  const activePrompt = useMemo(
    () => prompts.find((p) => p.id === activeId) ?? null,
    [prompts, activeId],
  )

  const updateActive = useCallback(
    (patch: Partial<Pick<Prompt, 'title' | 'body'>>) => {
      setStore((s) => {
        const id = s.activeId
        if (!id) return s
        const next = s.prompts.map((p) =>
          p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
        )
        schedulePersist(next, id)
        return { ...s, prompts: next }
      })
    },
    [schedulePersist],
  )

  const selectPrompt = useCallback(
    (id: string) => {
      flushPersist()
      setStore((s) => {
        try {
          saveStore({ prompts: s.prompts, activeId: id })
          return { ...s, activeId: id, saveError: null, lastSavedAt: Date.now() }
        } catch (e) {
          return {
            ...s,
            activeId: id,
            saveError: e instanceof Error ? e.message : '无法写入本机存储',
          }
        }
      })
    },
    [flushPersist],
  )

  const createPrompt = useCallback(() => {
    flushPersist()
    setStore((s) => {
      const id = crypto.randomUUID()
      const item: Prompt = { id, title: '', body: '', updatedAt: Date.now() }
      const next = [...s.prompts, item]
      schedulePersist(next, id)
      return { ...s, prompts: next, activeId: id }
    })
  }, [flushPersist, schedulePersist])

  const deletePrompt = useCallback(
    (id: string) => {
      flushPersist()
      setStore((s) => {
        const next = s.prompts.filter((p) => p.id !== id)
        const wasActive = s.activeId === id
        const nextActive = wasActive ? sortPrompts(next)[0]?.id ?? null : s.activeId
        try {
          saveStore({ prompts: next, activeId: nextActive })
          return { ...s, prompts: next, activeId: nextActive, saveError: null, lastSavedAt: Date.now() }
        } catch (e) {
          return {
            ...s,
            prompts: next,
            activeId: nextActive,
            saveError: e instanceof Error ? e.message : '无法写入本机存储',
          }
        }
      })
    },
    [flushPersist],
  )

  const renamePrompt = useCallback(
    (id: string, title: string) => {
      setStore((s) => {
        const next = s.prompts.map((p) =>
          p.id === id ? { ...p, title, updatedAt: Date.now() } : p,
        )
        schedulePersist(next, s.activeId)
        return { ...s, prompts: next }
      })
    },
    [schedulePersist],
  )

  const replaceAll = useCallback(
    (imported: Prompt[]) => {
      flushPersist()
      setStore((s) => {
        const next = sortPrompts(imported)
        const nextActive = next[0]?.id ?? null
        try {
          saveStore({ prompts: next, activeId: nextActive })
          return { ...s, prompts: next, activeId: nextActive, saveError: null, lastSavedAt: Date.now() }
        } catch (e) {
          return {
            ...s,
            prompts: next,
            activeId: nextActive,
            saveError: e instanceof Error ? e.message : '无法写入本机存储',
          }
        }
      })
    },
    [flushPersist],
  )

  const mergeImported = useCallback(
    (imported: Prompt[]) => {
      flushPersist()
      setStore((s) => {
        const next = mergeById(s.prompts, imported)
        const nextActive = next.some((p) => p.id === s.activeId)
          ? s.activeId
          : next[0]?.id ?? null
        try {
          saveStore({ prompts: next, activeId: nextActive })
          return { ...s, prompts: next, activeId: nextActive, saveError: null, lastSavedAt: Date.now() }
        } catch (e) {
          return {
            ...s,
            prompts: next,
            activeId: nextActive,
            saveError: e instanceof Error ? e.message : '无法写入本机存储',
          }
        }
      })
    },
    [flushPersist],
  )

  const retrySave = useCallback(() => {
    persist(promptsRef.current, activeIdRef.current)
  }, [persist])

  return {
    prompts,
    sortedPrompts,
    activeId,
    activePrompt,
    saveError,
    lastSavedAt,
    updateActive,
    selectPrompt,
    createPrompt,
    deletePrompt,
    renamePrompt,
    replaceAll,
    mergeImported,
    flushPersist,
    retrySave,
  }
}
