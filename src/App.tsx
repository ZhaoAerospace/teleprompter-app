import {
  Alert,
  Box,
  Button,
  CssBaseline,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  ThemeProvider,
} from '@mui/material'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EditorPanel } from './components/EditorPanel'
import { PromptListPanel } from './components/PromptListPanel'
import { TopAppBar } from './components/TopAppBar'
import { usePromptWorkbench } from './hooks/usePromptWorkbench'
import { createAppTheme } from './theme'
import { parseImportedPrompts } from './storage'
import type { Prompt } from './types'
import type { ThemePreference } from './types'

const THEME_KEY = 'teleprompter-theme'

function loadThemePref(): ThemePreference {
  const v = localStorage.getItem(THEME_KEY)
  if (v === 'dark' || v === 'light') return v
  return 'light'
}

function AppShell({
  mode,
  onToggleTheme,
}: {
  mode: ThemePreference
  onToggleTheme: () => void
}) {
  const isMdUp = useMediaQuery('(min-width:900px)')
  const workbench = usePromptWorkbench()
  const titleRef = useRef<HTMLInputElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const [renameTarget, setRenameTarget] = useState<Prompt | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<Prompt | null>(null)
  const [importCandidates, setImportCandidates] = useState<Prompt[] | null>(null)
  const [toast, setToast] = useState<{ msg: string; severity: 'success' | 'error' } | null>(null)

  const showToast = useCallback((msg: string, severity: 'success' | 'error' = 'success') => {
    setToast({ msg, severity })
  }, [])

  const handleNew = useCallback(() => {
    workbench.createPrompt()
    requestAnimationFrame(() => titleRef.current?.focus())
  }, [workbench])

  const handleCopy = useCallback(async () => {
    const body = workbench.activePrompt?.body ?? ''
    if (!body.trim()) return
    try {
      await navigator.clipboard.writeText(body)
      showToast('已复制到剪贴板')
    } catch {
      showToast('复制失败，请检查浏览器权限', 'error')
    }
  }, [workbench.activePrompt?.body, showToast])

  const openRename = useCallback((id: string) => {
    const p = workbench.prompts.find((x) => x.id === id)
    if (p) {
      setRenameTarget(p)
      setRenameValue(p.title)
    }
  }, [workbench.prompts])

  const openDelete = useCallback((id: string) => {
    const p = workbench.prompts.find((x) => x.id === id)
    if (p) setDeleteTarget(p)
  }, [workbench.prompts])

  const handleImportPick = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const onImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      e.target.value = ''
      if (!file) return
      try {
        const text = await file.text()
        const prompts = parseImportedPrompts(text)
        setImportCandidates(prompts)
      } catch (err) {
        showToast(err instanceof Error ? err.message : '导入失败', 'error')
      }
    },
    [showToast],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault()
        void handleCopy()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleCopy])

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <TopAppBar
        mode={mode}
        onToggleTheme={onToggleTheme}
        prompts={workbench.prompts}
        onImportClick={handleImportPick}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={onImportFile}
      />

      <Box
        component="main"
        sx={{
          flex: 1,
          width: '100%',
          maxWidth: 1280,
          mx: 'auto',
          px: { xs: 2, sm: 2.5, md: 3 },
          py: 2,
          height: 'calc(100vh - 56px)',
          boxSizing: 'border-box',
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: isMdUp ? '280px 1fr' : '1fr',
            gridTemplateRows: isMdUp ? '1fr' : 'auto 1fr',
            gap: 2,
            height: '100%',
            minHeight: 0,
          }}
        >
          <Box sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <PromptListPanel
              prompts={workbench.sortedPrompts}
              activeId={workbench.activeId}
              onSelect={workbench.selectPrompt}
              onNew={handleNew}
              onRename={openRename}
              onDelete={openDelete}
            />
          </Box>
          <Box sx={{ minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            <EditorPanel
              active={workbench.activePrompt}
              titleRef={titleRef}
              onChangeTitle={(v) => workbench.updateActive({ title: v })}
              onChangeBody={(v) => workbench.updateActive({ body: v })}
              onCopy={() => void handleCopy()}
              saveError={workbench.saveError}
              lastSavedAt={workbench.lastSavedAt}
              onRetrySave={workbench.retrySave}
            />
          </Box>
        </Box>
      </Box>

      <Dialog open={Boolean(renameTarget)} onClose={() => setRenameTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>重命名</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="标题"
            fullWidth
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRenameTarget(null)}>取消</Button>
          <Button
            variant="contained"
            onClick={() => {
              if (renameTarget) workbench.renamePrompt(renameTarget.id, renameValue)
              setRenameTarget(null)
            }}
          >
            保存
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)} fullWidth maxWidth="xs">
        <DialogTitle sx={{ fontWeight: 600 }}>删除提示词？</DialogTitle>
        <DialogContent>
          <Box sx={{ color: 'text.secondary', fontSize: 14 }}>此操作无法撤销。确定要删除这条提示词吗？</Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setDeleteTarget(null)}>
            取消
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (deleteTarget) workbench.deletePrompt(deleteTarget.id)
              setDeleteTarget(null)
            }}
          >
            确认删除
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(importCandidates)} onClose={() => setImportCandidates(null)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ fontWeight: 600 }}>导入备份</DialogTitle>
        <DialogContent>
          <Box sx={{ color: 'text.secondary', fontSize: 14, mb: 1 }}>
            已读取 {importCandidates?.length ?? 0} 条提示词。请选择导入方式：
          </Box>
          <Box sx={{ color: 'text.secondary', fontSize: 13 }}>
            「合并」将按 id 保留较新的版本；「覆盖」将用文件内容替换当前列表。
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, flexWrap: 'wrap', gap: 1 }}>
          <Button onClick={() => setImportCandidates(null)}>取消</Button>
          <Button
            variant="outlined"
            onClick={() => {
              if (importCandidates) workbench.mergeImported(importCandidates)
              setImportCandidates(null)
              showToast('已合并导入')
            }}
          >
            合并
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              if (importCandidates) workbench.replaceAll(importCandidates)
              setImportCandidates(null)
              showToast('已覆盖导入')
            }}
          >
            覆盖
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={3000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: 24, sm: 24 } }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? 'success'}
          variant="filled"
          sx={{
            width: '100%',
            maxWidth: 'min(360px, calc(100vw - 32px))',
            bgcolor: toast?.severity === 'error' ? '#7F1D1D' : '#111827',
            color: '#fff',
            '& .MuiAlert-icon': { color: '#fff' },
          }}
        >
          {toast?.msg}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default function App() {
  const [mode, setMode] = useState<ThemePreference>(loadThemePref)
  const theme = useMemo(() => createAppTheme(mode), [mode])

  const toggleTheme = useCallback(() => {
    setMode((m) => {
      const next: ThemePreference = m === 'light' ? 'dark' : 'light'
      localStorage.setItem(THEME_KEY, next)
      return next
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell mode={mode} onToggleTheme={toggleTheme} />
    </ThemeProvider>
  )
}
