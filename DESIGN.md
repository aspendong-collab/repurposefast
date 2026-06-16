# RePurposeFast — AI Native 前端架构设计方案

## 一、设计理念

### 核心原则
```
传统 SaaS:   用户点击按钮 → 等待 → 看结果
AI Native:  用户表达意图 → AI 流式执行 → 实时反馈 → 对话式精调
```

### 三条铁律
1. **输入即意图** — 不需要选择格式、语言、模式，粘贴链接 AI 自动判断一切
2. **过程可见** — 不展示 loading spinner，展示 AI 正在做什么（"正在转写第 3 段…"）
3. **结果可对话** — 不是静态输出，每段内容都可以对话式精调

---

## 二、竞品 & 参考分析

| 产品 | 学到什么 | 不学什么 |
|------|---------|---------|
| **UniScribe** | 简洁输入 + 多格式导出，免费额度引流 | 传统表单式交互，无流式输出 |
| **ChatGPT/Perplexity** | 流式输出、对话式精调、单一输入框 | 通用对话界面不适合结构化多格式输出 |
| **Lovable/Bolt.new** | 生成过程可视化、实时预览 | 面向开发场景，非内容创作 |
| **Notion AI** | 内联 AI 改写、diff 对比 | 文档编辑器太重 |
| **Descript** | 音视频编辑 + 转录一体化 | 桌面端思维，非 web-first |

### 差异化定位
> **UniScribe 是"转写工具"，RePurposeFast 是"内容生产线"**
> 核心差异：不是输出一个结果，而是输出一个**可对话迭代的内容工作台**。

---

## 三、信息架构

```
/                           → 重定向到 /app
/app                        → ★ 核心工作台（整个产品只有这一页）
  ├─ 意图输入区
  ├─ 流式处理区
  └─ 结果画廊区

/app/share/[id]             → 分享页面

/tools/*                    → SEO 落地页（已有，不变）
/api/repurpose/transcribe   → 转写 API
/api/repurpose/repurpose    → 改写 API（改为流式 SSE）
/api/repurpose/refine       → 新增：对话式精调 API
```

**关键决策：整个产品核心只有 `/app` 一个页面。** 不拆分路由，用状态驱动视图切换。

---

## 四、页面设计 — 核心工作台 `/app`

### 4.1 桌面端布局（三阶段渐进式）

```
┌──────────────────────────────────────────────────────────────┐
│  Header: 🏷️ RePurposeFast          [历史] [主题] [语言]     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│                   ┌─────────────────────┐                    │
│                   │                     │                    │
│                   │   粘贴视频链接       │  ← 最大、最显眼   │
│                   │   或拖拽文件上传     │                    │
│                   │                     │                    │
│                   │   🔗 粘贴链接       │                    │
│                   │   📁 上传文件       │                    │
│                   │                     │                    │
│                   └─────────────────────┘                    │
│                                                              │
│   快速开始: [YouTube→公众号] [播客→Newsletter] [会议→纪要]    │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  ★ 处理完成后自动展开为画廊视图 ★                            │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│  │📝 公众号   │ │❤️ 小红书   │ │🐦 Twitter  │ │💼 LinkedIn│  │
│  │            │ │            │ │            │ │           │  │
│  │ [预览内容] │ │ [预览内容] │ │ [预览内容] │ │[预览内容] │  │
│  │            │ │            │ │            │ │           │  │
│  │ [复制] [下载] [对话精调]  │ │ [复制] [下载] [对话精调]   │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌──────────┐  │
│  │📰 博客     │ │🔍 SEO文章  │ │📧 Newsletter│ │🎯 摘要   │  │
│  └────────────┘ └────────────┘ └────────────┘ └──────────┘  │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 移动端布局（全屏滑动卡片）

```
┌──────────────┐
│ Header       │
├──────────────┤
│              │
│  粘贴链接    │  ← 初始状态：全屏输入
│  [智能输入框]│
│              │
│  快捷入口    │
│  [卡片1][2]  │
│              │
├──────────────┤
│ ★ 结果 ★    │  ← 处理完成后：全屏卡片
│              │
│ ┌──────────┐ │
│ │📝 公众号 │ │  ← 左右滑动切换格式
│ │ 内容预览 │ │
│ │          │ │
│ │  [操作]  │ │
│ └──────────┘ │
│              │
│ ●●○ ← 页码指示器
└──────────────┘
```

---

## 五、关键交互设计

### 5.1 输入阶段 — "零配置启动"

```
用户粘贴 https://www.youtube.com/watch?v=xxx
         ↓
AI 自动判断:
  - 平台: YouTube ✅
  - 语言: 自动检测 →
  - 建议格式: 公众号文章 + Twitter 线程 + 小红书笔记（智能推荐3个）
         ↓
自动开始转写（无需点击按钮）
显示: "正在理解视频内容…▌"（流式状态文字）
```

### 5.2 处理阶段 — "过程即体验"

不是：
```
⏳ 正在处理，请稍候...  [████████░░] 80%
```

而是：
```
🔍 正在转写音频 (已处理 3/12 分钟)
📝 已提取 2,340 字
✨ 正在生成公众号文章...
✨ 正在生成小红书笔记...
🐦 正在生成 Twitter 线程...
```

每完成一个格式，对应的卡片从 loading skeleton 变成真实内容（streaming 逐字出现）。

### 5.3 结果阶段 — "画廊 + 对话精调"

**卡片交互：**
```
┌─ 公众号文章 ────────────────────────────┐
│                                         │
│ 《5个 AI 工具让你工作效率翻倍》          │
│                                         │
│ 最近AI工具层出不穷...（前100字预览）     │
│                                         │
│ ───────────────────────────────────────  │
│ [📋 复制全文] [⬇ 下载MD] [🔗 分享链接]  │
│ [💬 对话精调]                            │
└─────────────────────────────────────────┘
```

**点击「对话精调」后：**
```
┌─ 对话精调 ──────────────────────────────┐
│                                         │
│ AI: 我已经帮你生成了公众号文章。          │
│     你可以说 "更口语化一点" 或           │
│     "加上具体案例" 来让我调整。          │
│                                         │
│ 👤 你: 把开头改得更有吸引力              │
│                                         │
│ AI: 好的，我改成了悬念式开头...          │
│     （原文 diff 高亮显示改动部分）        │
│                                         │
│ 📝 [接受] [撤销] [继续对话...]           │
└─────────────────────────────────────────┘
```

### 5.4 流式输出细节

所有内容生成都使用 SSE (Server-Sent Events) 流式传输：

```
HTTP Response:
Content-Type: text/event-stream

event: status
data: {"phase":"transcribing","progress":45,"message":"转写中..."}

event: chunk
data: {"format":"wechat-article","text":"最近"}

event: chunk
data: {"format":"wechat-article","text":"AI工具"}

event: complete
data: {"format":"wechat-article","metadata":{"wordCount":1520,"readingTime":5}}
```

前端实时渲染，每个字符以打字机效果出现。

---

## 六、组件树

```
AppPage (主页面)
├── Header
│   ├── Logo
│   ├── HistoryButton (历史记录抽屉)
│   ├── ThemeToggle
│   └── LanguageSelector
│
├── InputZone (意图输入区 — 初始状态)
│   ├── SmartInput (智能输入框)
│   │   ├── URLInput (粘贴链接)
│   │   ├── FileDropzone (拖拽上传)
│   │   └── InputModeToggle (链接/文件切换)
│   ├── QuickStartCards (快捷入口)
│   │   └── QuickStartCard[] (预设场景卡片)
│   └── ErrorToast
│
├── ProcessingZone (处理状态区 — 处理中显示)
│   ├── ProgressTimeline (时间线式进度)
│   │   ├── ProgressStep (转写中/转写完成/生成中/生成完成)
│   │   └── StatusText (流式状态文字)
│   └── PreviewCards (提前完成的卡片)
│
└── GalleryZone (结果画廊区 — 完成后显示)
    ├── GalleryHeader (标题 + 操作)
    ├── FormatCardGrid (卡片网格/瀑布流)
    │   └── FormatCard[] (每张格式卡片)
    │       ├── CardPreview (内容预览)
    │       ├── CardActions (复制/下载/分享)
    │       └── RefineChat (对话精调抽屉)
    │           ├── ChatMessages[]
    │           ├── DiffView (改动对比)
    │           └── ChatInput
    └── EmptyState (无结果时)
```

---

## 七、数据流 & 状态管理

### 状态机

```
        粘贴URL / 上传文件
              ↓
    ┌── IDLE ──────────────────┐
    │                          ↓
    │                     TRANSCRIBING
    │                          ↓
    │                     TRANSCRIBED ────→ ERROR
    │                          ↓
    │                     GENERATING (每个格式独立状态)
    │                          ↓
    └── COMPLETED ←────── GENERATED ←── REFINING (对话精调)
```

### 核心 State

```typescript
interface AppState {
  // 输入
  inputMode: 'url' | 'file'
  inputValue: string
  detectedLanguage: string | null
  detectedPlatform: string | null

  // 处理
  phase: 'idle' | 'transcribing' | 'generating' | 'completed'
  progress: { current: number; total: number; message: string }

  // 结果
  formats: FormatResult[]  // 已选择/生成的格式列表
  transcripts: TranscriptSegment[]

  // UI
  activeCard: string | null   // 当前展开的卡片
  refineChatOpen: boolean     // 对话精调面板
}
```

---

## 八、设计系统 (Design Tokens)

### 色彩体系
```
Primary (紫色系 — AI/科技感):
  --primary: 258 90% 62%
  --primary-foreground: 0 0% 100%

Background (深色优先 — 内容创作场景护眼):
  --background: 228 40% 3%     (dark)
  --background: 0 0% 100%      (light)

Surface (卡片):
  --card: 228 30% 7%
  --card-hover: 228 30% 10%

Accent (各平台品牌色):
  --wechat: #07C160
  --xiaohongshu: #FF2442
  --twitter: #1DA1F2
  --linkedin: #0A66C2
```

### 排版
```
标题: 32px/40px bold (Geist Sans)
正文: 15px/24px regular
代码: 13px/20px mono (Geist Mono)
```

### 动效
```
输入框聚焦: 紫色光晕扩散 (0.3s ease-out)
卡片出现: 从下方淡入 + 微上移 (0.4s spring)
流式文字: 逐字出现 + 光标闪烁
进度条: 平滑渐变流光
状态切换: 交叉淡入淡出 (0.3s)
```

### 微交互
```
按钮悬停: scale(1.02) + 阴影增强
卡片悬停: 上浮 4px + 边框变紫色
复制成功: 按钮变色 + ✓ 图标 + toast
下载: 图标跳动动画
```

---

## 九、响应式断点

| 断点 | 布局 | 卡片列数 |
|------|------|---------|
| < 640px (mobile) | 全屏滑动卡片 | 1 |
| 640-1024px (tablet) | 双列网格 | 2 |
| > 1024px (desktop) | 自适应瀑布流 | 3-4 |

---

## 十、实现计划

### Phase 1: 核心工作台重构
1. `components/workbench/` — 新组件目录
2. `app/app/page.tsx` — 新的 `/app` 工作台页面
3. SSE 流式 API (`/api/repurpose/stream`)
4. 状态机 Hook (`useWorkbenchState`)

### Phase 2: 交互增强
5. 对话精调 (`RefineChat`)
6. Diff 对比视图
7. 键盘快捷键
8. 动画和微交互

### Phase 3: 体验完善
9. 历史记录抽屉
10. 分享页面
11. 深色/浅色主题切换
12. 移动端适配
