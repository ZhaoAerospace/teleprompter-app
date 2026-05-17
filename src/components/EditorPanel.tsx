import KeyboardIcon from '@mui/icons-material/Keyboard'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { Box, Button, InputBase, Link, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { RefObject } from 'react'
import { useRef } from 'react'
import type { Prompt } from '../types'
import { designTokens } from '../theme'

type Props = {
  active: Prompt | null
  titleRef: RefObject<HTMLInputElement | null>
  onChangeTitle: (v: string) => void
  onChangeBody: (v: string) => void
  onCopy: () => void
  saveError: string | null
  lastSavedAt: number | null
  onRetrySave: () => void
}

const mono =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'

function formatInsertedTimestamp(d: Date) {
  const z = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())} ${z(d.getHours())}:${z(d.getMinutes())}:${z(d.getSeconds())}`
}

function appleModKey(): string {
  if (typeof navigator === 'undefined') return 'Ctrl'
  return /Mac|iPhone|iPad|iPod/i.test(navigator.userAgent) ? '⌘' : 'Ctrl'
}

export function EditorPanel({
  active,
  titleRef,
  onChangeTitle,
  onChangeBody,
  onCopy,
  saveError,
  lastSavedAt,
  onRetrySave,
}: Props) {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const bodyEmpty = !active?.body.trim()
  const bodyRef = useRef<HTMLTextAreaElement | null>(null)
  const modKey = appleModKey()

  const copyComboKbdSx = {
    px: 0.85,
    py: 0.35,
    borderRadius: '6px',
    fontFamily: mono,
    fontSize: 11,
    fontWeight: 700 as const,
    lineHeight: 1.2,
    color: isDark ? '#FEF3C7' : '#92400E',
    bgcolor: isDark ? alpha('#F59E0B', 0.28) : alpha('#FFFBEB', 0.95),
    border: `1px solid ${isDark ? alpha('#FBBF24', 0.5) : alpha('#D97706', 0.45)}`,
    boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.06)' : '0 1px 0 rgba(15,23,42,0.05)',
  }

  const selectionColor = alpha(designTokens.primary, 0.18)

  const savedLabel =
    lastSavedAt != null
      ? `已保存 ${new Date(lastSavedAt).toLocaleTimeString(undefined, {
          hour: '2-digit',
          minute: '2-digit',
        })}`
      : '尚未保存'

  const handleAreaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const ta = e.currentTarget
      const start = ta.selectionStart
      const end = ta.selectionEnd
      const value = ta.value
      const insert = '  '
      const next = value.slice(0, start) + insert + value.slice(end)
      onChangeBody(next)
      requestAnimationFrame(() => {
        ta.selectionStart = ta.selectionEnd = start + insert.length
      })
    }
  }

  const handleInsertTimestamp = () => {
    if (!active) return
    const stamp = formatInsertedTimestamp(new Date())
    const ta = bodyRef.current
    const value = active.body
    if (!ta || document.activeElement !== ta) {
      onChangeBody(value + stamp)
      return
    }
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const next = value.slice(0, start) + stamp + value.slice(end)
    onChangeBody(next)
    requestAnimationFrame(() => {
      const pos = start + stamp.length
      ta.selectionStart = ta.selectionEnd = pos
      ta.focus()
    })
  }

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: { xs: '50vh', md: '100%' },
        height: { md: '100%' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 56,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <InputBase
          inputRef={titleRef}
          placeholder="标题（可选）"
          value={active?.title ?? ''}
          onChange={(e) => onChangeTitle(e.target.value)}
          fullWidth
          disabled={!active}
          sx={{
            fontSize: 16,
            fontWeight: 600,
            input: { padding: 0, color: theme.palette.text.primary },
            '& .MuiInputBase-input::placeholder': {
              color: designTokens.placeholder,
              opacity: 1,
            },
          }}
        />
        <Button
          variant="contained"
          disabled={bodyEmpty}
          onClick={onCopy}
          sx={{
            height: 36,
            px: 1.5,
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
            bgcolor: designTokens.primary,
            '&:hover': { bgcolor: designTokens.primaryHover },
            '&.Mui-disabled': { opacity: 0.5, color: '#fff' },
          }}
        >
          复制全文
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 44,
          px: 2,
          py: 1,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography sx={{ fontSize: 12, color: theme.palette.text.secondary, flex: 1 }}>
          {active ? `${active.body.length} 字符` : '—'}
        </Typography>
        <Box sx={{ width: 1, height: 20, bgcolor: theme.palette.divider }} />
        <Button
          size="small"
          variant="outlined"
          startIcon={<ScheduleIcon sx={{ fontSize: 16 }} />}
          onClick={handleInsertTimestamp}
          disabled={!active}
          sx={{
            height: 28,
            px: 1,
            fontSize: 12,
            fontWeight: 500,
            borderColor: theme.palette.divider,
            color: theme.palette.text.primary,
            '&:hover': { borderColor: theme.palette.divider, bgcolor: isDark ? alpha('#fff', 0.06) : designTokens.pageBg },
          }}
        >
          插入时间
        </Button>
      </Box>

      <Box
        component="textarea"
        ref={bodyRef}
        value={active?.body ?? ''}
        onChange={(e) => onChangeBody(e.target.value)}
        onKeyDown={handleAreaKeyDown}
        disabled={!active}
        spellCheck={false}
        sx={{
          flex: 1,
          width: '100%',
          minHeight: { xs: 260, sm: 360 },
          resize: 'none',
          border: 'none',
          outline: 'none',
          p: 2,
          fontFamily: mono,
          fontSize: 15,
          lineHeight: '22px',
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          '&::selection': {
            backgroundColor: selectionColor,
          },
        }}
      />

      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          borderLeft: `4px solid ${designTokens.primary}`,
          background: isDark
            ? `linear-gradient(125deg, ${alpha(designTokens.primary, 0.22)} 0%, ${alpha('#F59E0B', 0.12)} 42%, transparent 72%), ${alpha(theme.palette.background.paper, 1)}`
            : `linear-gradient(125deg, ${alpha(designTokens.primary, 0.14)} 0%, ${alpha('#F59E0B', 0.18)} 45%, transparent 75%), ${alpha(designTokens.primary, 0.06)}`,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <KeyboardIcon sx={{ fontSize: 18, color: designTokens.primary }} />
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 700,
              color: isDark ? alpha('#BFDBFE', 0.98) : designTokens.primary,
              letterSpacing: '0.04em',
            }}
          >
            快捷键
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 1,
              rowGap: 0.75,
            }}
          >
            <Box
              component="kbd"
              sx={{
                px: 0.85,
                py: 0.35,
                borderRadius: '6px',
                fontFamily: mono,
                fontSize: 11,
                fontWeight: 700,
                lineHeight: 1.2,
                color: isDark ? '#EEF2FF' : '#1E3A8A',
                bgcolor: isDark ? alpha('#6366F1', 0.35) : alpha('#FFF', 0.95),
                border: `1px solid ${isDark ? alpha('#A5B4FC', 0.55) : alpha(designTokens.primary, 0.4)}`,
                boxShadow: isDark ? 'inset 0 1px 0 rgba(255,255,255,0.08)' : '0 1px 0 rgba(15,23,42,0.06)',
              }}
            >
              Tab
            </Box>
            <Typography sx={{ fontSize: 12.5, color: theme.palette.text.primary, flex: '1 1 140px' }}>
              在正文内插入两个空格（缩进），不会切换到其他控件
            </Typography>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 0.65,
              rowGap: 0.65,
            }}
          >
            <Box component="kbd" sx={copyComboKbdSx}>
              {modKey}
            </Box>
            <Typography
              component="span"
              sx={{ fontSize: 13, fontWeight: 700, color: alpha(theme.palette.text.secondary, 0.9), px: 0.1 }}
            >
              +
            </Typography>
            <Box component="kbd" sx={copyComboKbdSx}>
              Shift
            </Box>
            <Typography
              component="span"
              sx={{ fontSize: 13, fontWeight: 700, color: alpha(theme.palette.text.secondary, 0.9), px: 0.1 }}
            >
              +
            </Typography>
            <Box component="kbd" sx={copyComboKbdSx}>
              C
            </Box>
            <Typography sx={{ fontSize: 12.5, color: theme.palette.text.primary, flex: '1 1 160px', ml: { xs: 0, sm: 1 } }}>
              全局复制当前提示词正文（与「复制全文」按钮相同）
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          minHeight: 36,
          px: 2,
          py: 1,
          borderTop: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.paper,
        }}
      >
        {saveError ? (
          <>
            <Typography sx={{ fontSize: 12, color: designTokens.destructive, flex: 1 }}>{saveError}</Typography>
            <Link
              component="button"
              type="button"
              underline="always"
              onClick={onRetrySave}
              sx={{ fontSize: 12, color: designTokens.primary, cursor: 'pointer' }}
            >
              重试
            </Link>
          </>
        ) : (
          <Typography sx={{ fontSize: 12, color: designTokens.success }}>{savedLabel}</Typography>
        )}
      </Box>
    </Box>
  )
}
