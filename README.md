# teleprompter-app（提示词工作台）

纯前端提示词管理工具：撰写、列表切换、本机自动保存、一键复制与备份导入，界面与交互对齐仓库内 `idea/pure-frontend-prompt-workbench-mvp-spec.md`。

## 功能概览

- 多提示词列表（按更新时间排序）、搜索过滤、新建 / 重命名 / 删除（含确认）
- 主编辑区：标题 + 正文，正文 Tab 插入两个空格，`Cmd/Ctrl+Shift+C` 复制全文
- 防抖自动写入 `localStorage`（约 450ms），底部显示保存状态与错误重试
- 导出 JSON 备份、导入 JSON（合并或覆盖）
- 浅色 / 深色主题（写入 `localStorage`）
- 响应式布局：窄屏列表在上、编辑区在下

## 环境要求

- **Node.js**：与 `.nvmrc` 一致（当前为 **20**）。若使用 nvm：`nvm install` / `nvm use`

## 本地开发与构建

```bash
cd teleprompter-app
npm ci          # 或 npm install
npm run dev     # 开发：http://localhost:5173
npm run build   # 产出 dist/
npm run preview # 预览生产构建
```

## GitHub Pages 部署

1. 在仓库 **Settings → Pages** 中启用 GitHub Pages，源选择 **GitHub Actions**。
2. 工作流：仓库根目录 `.github/workflows/deploy-teleprompter-pages.yml`，在 **`master`** 分支推送时构建 `teleprompter-app` 并部署。
3. 构建使用 `VITE_BASE=/<仓库名>/`，与 `vite.config.ts` 中 `base` 一致；若站点挂在子路径，请保证与仓库名一致，否则需改工作流里的 `VITE_BASE`。

本地模拟子路径构建示例：

```bash
VITE_BASE=/your-repo/ npm run build
```

## 数据与隐私

- 数据仅存于浏览器本机（`localStorage`），不经过服务端。
- 清除站点数据或换浏览器会丢失内容，请定期使用「导出」备份。

## 授权

与上层仓库保持一致；若未声明，默认以仓库根目录许可证为准。
