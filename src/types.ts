export type Prompt = {
  id: string
  title: string
  body: string
  updatedAt: number
}

export type PromptStoreSnapshot = {
  prompts: Prompt[]
  activeId: string | null
}

export type ThemePreference = 'light' | 'dark'

export type ExportPayload = {
  version: 1
  exportedAt: string
  prompts: Prompt[]
}
