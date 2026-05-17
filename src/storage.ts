import type { ExportPayload, Prompt, PromptStoreSnapshot } from './types'

const STORAGE_KEY = 'teleprompter-app-v1'

function isPrompt(x: unknown): x is Prompt {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  return (
    typeof o.id === 'string' &&
    typeof o.title === 'string' &&
    typeof o.body === 'string' &&
    typeof o.updatedAt === 'number'
  )
}

export function loadStore(): PromptStoreSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { prompts: [], activeId: null }
    const data = JSON.parse(raw) as unknown
    if (!data || typeof data !== 'object') return { prompts: [], activeId: null }
    const o = data as Record<string, unknown>
    const promptsRaw = o.prompts
    const activeId = typeof o.activeId === 'string' ? o.activeId : null
    if (!Array.isArray(promptsRaw)) return { prompts: [], activeId: null }
    const prompts = promptsRaw.filter(isPrompt)
    return { prompts, activeId }
  } catch {
    return { prompts: [], activeId: null }
  }
}

export function saveStore(snapshot: PromptStoreSnapshot): void {
  const payload: PromptStoreSnapshot = {
    prompts: snapshot.prompts,
    activeId: snapshot.activeId,
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
}

export function buildExportPayload(prompts: Prompt[]): ExportPayload {
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    prompts,
  }
}

export function parseImportedPrompts(text: string): Prompt[] {
  const data = JSON.parse(text) as unknown
  let arr: unknown[]
  if (Array.isArray(data)) arr = data
  else if (data && typeof data === 'object' && Array.isArray((data as { prompts?: unknown }).prompts)) {
    arr = (data as { prompts: unknown[] }).prompts
  } else {
    throw new Error('文件格式不正确：需要 prompts 数组或导出 JSON')
  }
  const prompts = arr.filter(isPrompt)
  if (prompts.length === 0) throw new Error('未找到有效的提示词数据')
  return prompts
}
