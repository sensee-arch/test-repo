# .ai/about.md — AI Agent Project Constitution

## 项目概述

- 本项目是一个 **Web Todo List 单页应用（SPA）**，使用纯 HTML5 + CSS3 + Vanilla JavaScript ES6+ 构建
- **源文件位置**：`src/web/todo/`（index.html, style.css, app.js）
- 解决用户在日常任务管理中快速记录、跟踪和完成待办事项的需求，无需安装任何软件
- 运行环境：只需现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90、Safari ≥ 15），支持 `file://` 协议
- 本项目不涉及：用户认证、后端服务、数据库、API 接口、分页、标签分类、自动化测试、CI/CD 部署、PWA、推送通知

## 核心目标

- ✅ 实现完整的 **CRUD** 功能：创建（Create）、读取（Read）、更新（Update）、删除（Delete）待办事项
- ✅ 支持完成状态切换和视觉反馈（删除线、透明度变化）
- ✅ 支持按 **全部 / 活跃 / 已完成** 三种视图过滤
- ✅ 数据通过浏览器 **localStorage** 持久化，刷新不丢失
- ✅ 零外部依赖，单文件部署，打开即用
- ❌ 不追求后端同步或多端协同
- ❌ 不追求 PWA/离线能力或推送通知

## 技术架构

- **架构风格**：单体 SPA（Single-Page Application）
- **架构分层**（4 层，自底向上）：
  1. **Storage 层**：封装 localStorage 读写接口，提供 `loadTodos()`、`saveTodos()` 方法，try-catch 安全降级
  2. **State 层**：内存维护 `todos[]` 数组和 `filter` 字符串（`all`/`active`/`completed`），提供全套 CRUD 及过滤计数方法
  3. **Render 层**：基于 State 数据更新 DOM，使用 `document.createDocumentFragment` 批量操作，`textContent` 安全渲染
  4. **Event 层**：事件绑定与委托，处理键盘（Enter/Escape）→ 点击（Add/Toggle/Edit/Delete）→ 失焦（blur/save）交互
- **数据流**：用户操作 → DOM 事件 → Event 层 → State 方法 → Storage.saveTodos() 持久化 → Render 更新 UI
- **通信方式**：函数内部调用（同步），无网络通信

## 基础契约

### TodoItem 数据模型
| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| id | string | Y | 自动生成 | 8 字符唯一 ID，`Math.random().toString(36).substring(2, 10)` |
| title | string | Y | — | 任务内容，最大 200 字符 |
| completed | boolean | Y | false | false=未完成，true=已完成 |
| createdAt | number | Y | Date.now() | 创建时间戳（毫秒） |

### 存储契约
- **localStorage 键名**：`todo_items`
- **值格式**：TodoItem 数组的 JSON 字符串序列化
- **错误语义**：localStorage 操作失败时静默降级（`console.warn`），返回 `[]`，不抛出异常
- **排序规则**：按 `createdAt` 降序排列（最新创建的排在前面）

### 布局约束
| 设备 | 最小宽度 | 说明 |
|------|----------|------|
| 桌面端 | 1024px | 完整布局 |
| 平板 | 768px | 自适应间距 |
| 移动端 | 320px | 紧凑布局 |

### 安全约束
- **禁止** `innerHTML` 渲染用户输入内容（使用 `textContent` 替代）
- **禁止** `eval()` 或 `new Function()`
- **禁止** 修改待办列表容器之外的 DOM
- **禁止** 跨域脚本注入（XSS）

## Agent 划分

| 名称 | 角色 | 职责 | 输入来源 | 输出去向 |
|------|------|------|----------|----------|
| Host | 主持人 | 群聊欢迎/状态广播 | 用户消息 | 群聊 |
| Manager | 管理员 | 需求分析、方案设计、契约制定 | 用户需求 + Spec | Plan + Contract |
| Developer | 开发者 | 编码实现、提交代码 | Task 描述 | 代码提交与推送 |
| Reviewer | 审查者 | 代码审查、AC 验收 | 代码文件 | Review 报告 |

### 工作模式
- **Free Chat**：自由讨论、提问、规划
- `/spec`：需求规格制定与契约生成
- `/coding`：完整编码流水线（Plan → Contract → Setup → Assign → Code → Review → Summary）

## 运行与依赖

- **运行环境**：现代浏览器（Chrome ≥ 90、Firefox ≥ 90、Edge ≥ 90、Safari ≥ 15）
- **启动方式**：直接在浏览器中打开 `src/web/todo/index.html`
- **本地开发**：只需文本编辑器 + Git 客户端
- **外部分支命名**：`flyinghub-YYYYMMDDHHmmss`（基于本地时间戳生成）
- **无需**：Node.js、Python、Docker、包管理器、构建工具、CDN

## 协作规则

- **日志规范**：通过 `action_trace`（Base64 编码 Markdown）记录操作步骤和错误
- **契约优先**：编码前必须先完成 Spec → Plan → Contract 文档
- **上下文传递**：每个 Hub 独立维护自己的分支和文档，不跨 Hub 共享状态
- **自愈优先**：出现目录不存在、命令失败等错误先自动修复，3 次重试后再上报
- **Python 规则**：所有 Python 代码必须写入 `.py` 文件执行，禁止内联 `python3 -c "code"`
- **分支策略**：每个并行任务使用独立 `feat/xxx` 或 `flyinghub-xxx` 分支，不共用同一分支
- **禁止**：未经验证就假设全局状态或历史记忆；引用已压缩的对话记忆

## 演进原则

- **契约优先于实现**：任何新功能必须先完成 Spec 和 Contract 再编码
- **新能力优先通过新增模块实现**，不破坏现有模块边界
- **ADR 路径**：架构决策记录存储于 `docs/adr/`
- **扩展方向**（当前不实施）：标签分类、截止日期、优先级排序、搜索过滤、多端同步
