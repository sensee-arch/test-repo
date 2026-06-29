# ARCH — 架构文档

> 项目: test_repo
> 仓库: https://github.com/sensee-arch/test-repo
> 更新日期: 2026-06-29

---

## 1. 项目概述

### 项目定位

**test_repo** 是一个实验性/测试项目，旨在提供一个灵活的 AI Agent 协作编程的试验场。项目以 git 仓库协作的方式，让多个 AI Agent 在统一的架构规范下协同工作。

### 核心目标

- 验证和演练 AI Agent 协作编程工作流
- 建立标准化的 AI 项目协作流程（需求 → 方案 → 任务 → 开发 → 审核）
- 探索可复用的 AI Agent 协作模板和规范
- 记录和沉淀 AI 辅助开发的实践经验

### 核心功能（规划）

| 类别 | 说明 |
|------|------|
| 协作工作流 | Agent 间任务分配、开发、评审的标准流程 |
| 模板沉淀 | 可复用的需求规格、技术方案、任务分解模板 |
| 技术验证 | 可选技术栈的快速原型和验证 |

---

## 2. 技术选型

> 当前项目尚未选择具体技术栈。以下为推荐选项，实际选型应根据具体需求确定。

### 推荐技术栈

| 类别 | 推荐选项 | 备选方案 |
|------|----------|----------|
| **编程语言** | Python 3.11+ | Go, TypeScript/Node.js |
| **Web 框架** | FastAPI | Flask, Express, Gin |
| **数据库** | SQLite (开发) / PostgreSQL (生产) | MySQL, MongoDB |
| **API 风格** | RESTful API | GraphQL |
| **测试框架** | pytest | unittest, vitest |
| **代码格式** | Ruff / Black + isort | Prettier, gofmt |
| **CI/CD** | GitHub Actions | — |
| **包管理** | pip + requirements.txt / Poetry | npm, go mod |

### 技术选型原则

1. **简单优先** — 不做过度设计，够用就好
2. **可替换性** — 组件间通过接口解耦，便于替换
3. **测试驱动** — 核心逻辑必须可测试

---

## 3. 开发环境准备

### 前置条件

- Git 已安装并配置
- Python 3.11+ (若选择 Python 技术栈)

### 环境初始化

```bash
# 克隆仓库
git clone https://github.com/sensee-arch/test-repo.git
cd test-repo

# 创建虚拟环境（Python）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 安装开发依赖
pip install -r requirements-dev.txt
```

### 推荐开发工具

- **编辑器**: VS Code / Cursor
- **Git 客户端**: 命令行 + GitHub Desktop
- **API 测试**: curl / HTTPie / Bruno

---

## 4. 代码规范和约定

### 目录结构约定

```
test-repo/
├── .agent/               # AI Agent 工作文件（计划、任务等）
├── src/                  # 源代码
│   ├── core/            # 核心业务逻辑
│   ├── api/             # API 接口层
│   ├── models/          # 数据模型
│   ├── services/        # 服务层
│   └── utils/           # 工具函数
├── tests/               # 测试代码
│   ├── unit/            # 单元测试
│   └── integration/     # 集成测试
├── docs/                # 文档
├── scripts/             # 辅助脚本
├── requirements.txt     # 生产依赖
├── requirements-dev.txt # 开发依赖
├── ARCH.md              # 架构文档（本文件）
├── README.md            # 项目说明
└── LICENSE              # 许可证
```

### 编码规范

- **Python**: 遵循 PEP 8，使用 `ruff` 进行代码检查
- **命名规范**:
  - 类名: `PascalCase`
  - 函数/方法: `snake_case`
  - 变量: `snake_case`
  - 常量: `UPPER_SNAKE_CASE`
  - 私有成员: `_prefix`
- **类型注解**: 所有函数参数和返回值需加类型注解

### Git 提交规范

```
<type>: <简短描述>

<详细说明（可选）>
```

**提交类型 (type)**:

| 类型 | 说明 |
|------|------|
| `feat` | 新功能 |
| `fix` | 修复 |
| `docs` | 文档变更 |
| `refactor` | 重构 |
| `test` | 测试相关 |
| `chore` | 构建/工具/配置变更 |
| `style` | 代码格式化 |

### 分支策略

- `main` — 稳定主分支，始终保持可部署状态
- `YYYYMMDDHH-<descriptive-name>` — 功能开发分支（按日期命名）
- 功能开发完成后合并到 `main`

### 代码评审规范

1. 所有 PR 应包含清晰的变更描述和测试覆盖
2. 关键逻辑变更需至少一个 Agent 审核
3. 测试覆盖率不低于 80%

---

## 5. Agent 协作约定

### 工作流程

```
需求描述 → /spec 生成需求规格 → /plan 分解任务 → /assign 分配任务 → 开发实现 → 审核合并
```

### 工作文件

- `.agent/YYYYMMDDHH-<feature>/` — 按功能分支组织的 Agent 工作目录
  - `plan.md` — 技术方案和任务分解
  - `task-NNN.md` — 具体任务描述

---

## 6. 附录

### 参考资源

- [项目仓库](https://github.com/sensee-arch/test-repo)
- [OpenClaw 文档](https://docs.openclaw.ai)

### 修改历史

| 日期 | 变更内容 | 版本 |
|------|----------|------|
| 2026-06-29 | 创建初始架构文档 | v0.1 |
