import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import FileUploadOutlinedIcon from '@mui/icons-material/FileUploadOutlined'
import { AppBar, Box, Button, IconButton, Toolbar, Typography } from '@mui/material'
import type { ThemePreference } from '../types'
import { designTokens } from '../theme'
import type { Prompt } from '../types'
import { buildExportPayload } from '../storage'

type Props = {
  mode: ThemePreference
  onToggleTheme: () => void
  prompts: Prompt[]
  onImportClick: () => void
}

export function TopAppBar({ mode, onToggleTheme, prompts, onImportClick }: Props) {
  const handleExport = () => {
    const payload = buildExportPayload(prompts)
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `prompt-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const isDark = mode === 'dark'

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        zIndex: 50,
        height: 56,
        bgcolor: isDark ? designTokens.appBarDark : '#FFFFFF',
        color: isDark ? designTokens.appBarDarkText : designTokens.text,
        borderBottom: `1px solid ${isDark ? designTokens.appBarDarkBorder : designTokens.border}`,
        backgroundImage: 'none',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 56,
          maxWidth: 1280,
          width: '100%',
          mx: 'auto',
          px: { xs: 2, sm: 2 },
          gap: 1,
        }}
      >
        <Typography
          variant="h6"
          component="div"
          sx={{
            fontSize: 16,
            fontWeight: 600,
            lineHeight: '24px',
            flexGrow: 1,
          }}
        >
          提示词工作台
          <Typography
            component="span"
            sx={{
              display: { xs: 'none', sm: 'inline' },
              ml: 1,
              fontSize: 12,
              fontWeight: 400,
              color: isDark ? 'rgba(229,231,235,0.65)' : designTokens.muted,
            }}
          >
            仅本设备
          </Typography>
        </Typography>

        <IconButton
          onClick={onToggleTheme}
          aria-label={isDark ? '切换浅色' : '切换深色'}
          sx={{
            width: 40,
            height: 40,
            color: isDark ? designTokens.appBarDarkText : designTokens.muted,
            '&:hover': { bgcolor: isDark ? 'rgba(255,255,255,0.08)' : '#F1F5F9' },
          }}
        >
          {isDark ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
        </IconButton>

        <Button
          variant="outlined"
          size="small"
          startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={handleExport}
          sx={{
            height: 36,
            px: 1.5,
            fontSize: 14,
            fontWeight: 500,
            borderColor: isDark ? designTokens.appBarDarkBorder : designTokens.border,
            color: isDark ? designTokens.appBarDarkText : designTokens.text,
            display: { xs: 'none', sm: 'inline-flex' },
            '&:hover': {
              borderColor: isDark ? designTokens.appBarDarkBorder : designTokens.border,
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : designTokens.pageBg,
            },
          }}
        >
          导出
        </Button>

        <Button
          variant="outlined"
          size="small"
          startIcon={<FileUploadOutlinedIcon sx={{ fontSize: 18 }} />}
          onClick={onImportClick}
          sx={{
            height: 36,
            px: 1.5,
            fontSize: 14,
            fontWeight: 500,
            borderColor: isDark ? designTokens.appBarDarkBorder : designTokens.border,
            color: isDark ? designTokens.appBarDarkText : designTokens.text,
            display: { xs: 'none', sm: 'inline-flex' },
            '&:hover': {
              borderColor: isDark ? designTokens.appBarDarkBorder : designTokens.border,
              bgcolor: isDark ? 'rgba(255,255,255,0.06)' : designTokens.pageBg,
            },
          }}
        >
          导入
        </Button>

        {/* Compact icon-only on narrow screens */}
        <Box sx={{ display: { xs: 'flex', sm: 'none' }, gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={handleExport}
            aria-label="导出备份"
            sx={{ color: isDark ? designTokens.appBarDarkText : designTokens.muted }}
          >
            <FileDownloadOutlinedIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={onImportClick}
            aria-label="导入"
            sx={{ color: isDark ? designTokens.appBarDarkText : designTokens.muted }}
          >
            <FileUploadOutlinedIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
