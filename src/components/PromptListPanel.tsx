import AddIcon from '@mui/icons-material/Add'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import {
  Box,
  Button,
  IconButton,
  InputBase,
  List,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from '@mui/material'
import { useCallback, useMemo, useState } from 'react'
import { alpha, useTheme } from '@mui/material/styles'
import type { Prompt } from '../types'
import { designTokens } from '../theme'

function rowTitle(p: Prompt): string {
  const t = p.title.trim()
  if (t) return t
  const b = p.body.trim()
  if (b) return b.length > 40 ? `${b.slice(0, 40)}…` : b
  return '未命名'
}

function rowPreview(p: Prompt): string {
  const b = p.body.trim().replace(/\s+/g, ' ')
  if (!b) return '（暂无正文）'
  return b.length > 72 ? `${b.slice(0, 72)}…` : b
}

type Props = {
  prompts: Prompt[]
  activeId: string | null
  onSelect: (id: string) => void
  onNew: () => void
  onRename: (id: string) => void
  onDelete: (id: string) => void
}

export function PromptListPanel({ prompts, activeId, onSelect, onNew, onRename, onDelete }: Props) {
  const theme = useTheme()
  const [search, setSearch] = useState('')
  const [menuAnchor, setMenuAnchor] = useState<null | { el: HTMLElement; id: string }>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return prompts
    return prompts.filter((p) => {
      const hay = `${p.title}\n${p.body}`.toLowerCase()
      return hay.includes(q)
    })
  }, [prompts, search])

  const closeMenu = () => setMenuAnchor(null)

  const handleKeySearch = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setSearch('')
      ;(e.currentTarget as HTMLInputElement).blur()
    }
  }, [])

  return (
    <Box
      sx={{
        bgcolor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: '12px',
        boxShadow: '0 1px 2px rgba(15,23,42,0.06)',
        display: 'flex',
        flexDirection: 'column',
        height: { md: '100%' },
        minHeight: { xs: 240, md: 'unset' },
        maxHeight: { xs: '40vh', md: 'none' },
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 1.5,
          py: 1.1,
          minHeight: 48,
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: theme.palette.text.primary,
          }}
        >
          提示词
        </Typography>
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon sx={{ fontSize: 18 }} />}
          onClick={onNew}
          sx={{
            height: 32,
            px: 1.25,
            fontSize: 13,
            fontWeight: 600,
            bgcolor: designTokens.primary,
            '&:hover': { bgcolor: designTokens.primaryHover },
          }}
        >
          新增
        </Button>
      </Box>

      <Box sx={{ px: 1.5, py: 1 }}>
        <InputBase
          fullWidth
          placeholder="搜索标题或正文…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeySearch}
          sx={{
            height: 36,
            fontSize: 14,
            lineHeight: '20px',
            px: 1.25,
            borderRadius: '8px',
            bgcolor: theme.palette.mode === 'light' ? designTokens.pageBg : alpha(theme.palette.common.white, 0.06),
            border: `1px solid ${theme.palette.divider}`,
            '&.Mui-focused': {
              border: `2px solid ${designTokens.primary}`,
              paddingLeft: 10,
              paddingRight: 10,
            },
            input: { padding: 0, '&::placeholder': { color: designTokens.placeholder, opacity: 1 } },
          }}
        />
        <Typography
          sx={{
            mt: 1,
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.02em',
            color: theme.palette.text.secondary,
          }}
        >
          最近编辑
        </Typography>
      </Box>

      <List dense disablePadding sx={{ flex: 1, overflowY: 'auto', py: 0 }}>
        {filtered.length === 0 && prompts.length === 0 && (
          <Box
            sx={{
              px: 2,
              py: 4,
              textAlign: 'center',
              color: theme.palette.text.secondary,
              maxWidth: 240,
              mx: 'auto',
            }}
          >
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
              还没有提示词
            </Typography>
            <Typography sx={{ fontSize: 12, mb: 2 }}>从新建一篇开始，内容仅保存在本机。</Typography>
            <Button
              variant="contained"
              size="small"
              onClick={onNew}
              sx={{ bgcolor: designTokens.primary, '&:hover': { bgcolor: designTokens.primaryHover } }}
            >
              创建第一篇
            </Button>
          </Box>
        )}

        {filtered.length === 0 && prompts.length > 0 && (
          <Typography sx={{ px: 2, py: 2, fontSize: 13, color: theme.palette.text.secondary }}>
            没有匹配的条目
          </Typography>
        )}

        {filtered.map((p) => {
          const selected = p.id === activeId
          const selectedBg =
            theme.palette.mode === 'light' ? '#EFF6FF' : alpha(designTokens.primary, 0.18)
          const hoverBg =
            theme.palette.mode === 'light'
              ? designTokens.pageBg
              : alpha(theme.palette.common.white, 0.06)
          return (
            <ListItemButton
              key={p.id}
              onClick={() => onSelect(p.id)}
              selected={selected}
              sx={{
                alignItems: 'stretch',
                minHeight: 64,
                py: 1.25,
                px: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                '&.Mui-selected': {
                  bgcolor: selectedBg,
                  borderLeft: `3px solid ${designTokens.primary}`,
                  pl: `calc(12px - 3px)`,
                },
                '&:hover': { bgcolor: selected ? selectedBg : hoverBg },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.5, width: '100%' }}>
                <ListItemText
                  primary={rowTitle(p)}
                  secondary={rowPreview(p)}
                  sx={{ flex: 1, minWidth: 0, m: 0 }}
                  slotProps={{
                    primary: {
                      sx: {
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'text.primary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                    secondary: {
                      sx: {
                        fontSize: 12,
                        color: 'text.secondary',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                    },
                  }}
                />
                <IconButton
                  size="small"
                  aria-label="更多"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuAnchor({ el: e.currentTarget, id: p.id })
                  }}
                  sx={{
                    width: 32,
                    height: 32,
                    color: theme.palette.text.secondary,
                    '&:hover': { bgcolor: theme.palette.action.hover },
                  }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
            </ListItemButton>
          )
        })}
      </List>

      <Menu
        anchorEl={menuAnchor?.el}
        open={Boolean(menuAnchor)}
        onClose={closeMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              width: 160,
              borderRadius: '10px',
              border: `1px solid ${theme.palette.divider}`,
              boxShadow: '0 10px 30px rgba(15,23,42,0.12)',
              bgcolor: theme.palette.background.paper,
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            const id = menuAnchor?.id
            closeMenu()
            if (id) onRename(id)
          }}
          sx={{ fontSize: 14, minHeight: 44 }}
        >
          重命名
        </MenuItem>
        <MenuItem
          onClick={() => {
            const id = menuAnchor?.id
            closeMenu()
            if (id) onDelete(id)
          }}
          sx={{ fontSize: 14, color: designTokens.destructive, minHeight: 44 }}
        >
          删除
        </MenuItem>
      </Menu>
    </Box>
  )
}
