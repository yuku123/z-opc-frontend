# @yuku123/z-opc-frontend

> z-opc 共享前端组件工作区 · npm monorepo

10 个独立可发布的 React 组件包，统一在这里构建、版本、发布。

## 包清单

| 包 | 用途 | 版本 |
|---|---|---|
| [@yuku123/z-frontend-common](./packages/z-frontend-common) | AppLayout / StatusTag / LoginPage / ErrorBoundary + 统一 createRequest 工厂 | 0.1.1 |
| [@yuku123/z-config-frontend-component](./packages/z-config-frontend-component) | z-config 模块共享组件 | 0.1.0 |
| [@yuku123/z-ctc-frontend-component](./packages/z-ctc-frontend-component) | CTC 模块共享组件（peer-deps z-frontend-common） | 0.1.1 |
| [@yuku123/z-ext-frontend-component](./packages/z-ext-frontend-component) | z-ext 模块共享组件 | 0.1.0 |
| [@yuku123/z-meta-frontend-component](./packages/z-meta-frontend-component) | z-meta 模块共享组件 | 0.1.0 |
| [@yuku123/z-mist-frontend-component](./packages/z-mist-frontend-component) | z-mist 模块共享组件 | 0.1.0 |
| [@yuku123/z-oss-frontend-component](./packages/z-oss-frontend-component) | z-oss 模块共享组件 | 0.1.0 |
| [@yuku123/z-schedule-frontend-component](./packages/z-schedule-frontend-component) | z-schedule 模块共享组件（TS） | 0.1.0 |
| [@yuku123/z-task-frontend-component](./packages/z-task-frontend-component) | z-task 模块共享组件 | 0.1.0 |
| [@yuku123/z-wf-frontend-component](./packages/z-wf-frontend-component) | FlowDesigner 流程设计器（LogicFlow） | 0.1.0 |

## 目录结构

```
z-opc-frontend/
├── package.json              # workspaces 根
├── .npmrc                    # registry 配置
├── .github/workflows/        # CI/CD（全部跑在 GitHub Actions 上）
│   ├── ci.yml                # PR / push main → npm ci + build 验证
│   ├── publish.yml           # tag v* → 全部公开包 build + publish 到 npm
│   └── release.yml           # workflow_dispatch → 一键 bump + tag + 触发 publish
├── scripts/
│   ├── publish-all.sh        # 本地一键发所有公开包（调试/回退用）
│   └── release.sh            # 本地 bump 版本 + git tag
└── packages/
    ├── z-frontend-common/         ← 必须先发（有包 peer-deps 它）
    ├── z-config-frontend-component
    ├── z-ctc-frontend-component   ← peer-deps z-frontend-common
    ├── z-ext-frontend-component
    ├── z-meta-frontend-component
    ├── z-mist-frontend-component
    ├── z-oss-frontend-component
    ├── z-schedule-frontend-component
    ├── z-task-frontend-component
    └── z-wf-frontend-component
```

## 本地开发

```bash
# 1. 装依赖（hoist 到根 node_modules）
npm install

# 2. 全部 build
npm run build

# 3. 单包 build
npm run build:z-frontend-common
```

## 发新版本（推荐走 GitHub Actions）

### 方式 A：一键 release（推荐）

GitHub → Actions → **release** → Run workflow → 选 `patch` / `minor` / `major`（或 `auto`）→ 运行。

工作流会自动：
1. 把所有公开包的 `version` 字段按级别 bump
2. commit + push 到 `main`
3. 打 `vX.Y.Z` tag 并 push
4. `publish.yml` 立即触发，build + publish 全部公开包到 npm

带 `--provenance` 签名，安全可溯源。

### 方式 B：手动打 tag

```bash
# 1. 升级所有公开包版本 + commit + tag
bash scripts/release.sh patch

# 2. push tag → publish.yml 自动接管
git push origin main --tags
```

> 不需要 `--tags` 之外的任何操作，CI 会读 tag 然后发布。

## 本地手动发（仅调试用）

```bash
# Dry-run，只列出待发布的包
bash scripts/publish-all.sh --dry-run

# 实际发（需先 npm login，或 NPM_TOKEN=xxx ...）
bash scripts/publish-all.sh
```

## CI/CD 工作流细节

| Workflow | 触发条件 | 作用 |
|---|---|---|
| `ci.yml` | PR / push main | 跑 `npm ci` + `npm run build`，验证可编译 |
| `publish.yml` | tag `v*` / 手动 dispatch | 跑 `npm ci` → build → 按拓扑序 publish 全部公开包 |
| `release.yml` | 手动 dispatch | 输入 bump level（patch/minor/major/auto）→ bump → commit → push tag → 触发 publish |

### 拓扑顺序保证

`publish.yml` 在 publish 阶段按以下顺序发布（Node 脚本动态生成）：
1. `@yuku123/z-frontend-common` 优先
2. 其余按字典序

这是因为 `@yuku123/z-ctc-frontend-component` 的 `peerDependencies` 引用了
`@yuku123/z-frontend-common`，把后者先发到 npm 上能保证 npm 元数据完整。

### 跳过某个包

把对应包 `package.json` 的 `"private": false` 改成 `"private": true` 即可，CI 会自动跳过。

## 必填 Secrets

| Secret | 何时需要 | 怎么获取 |
|---|---|---|
| `NPM_TOKEN` | 任何 publish 任务 | https://www.npmjs.com/settings/.../tokens → Generate New Token → **Automation** |

把 token 加到：GitHub repo → Settings → Secrets and variables → Actions → New repository secret。

## 长期方案：拆出独立仓库

当前 `z-opc-frontend/` 是从 z-opc monorepo 抽出来的（保留完整 git history）。已在
`git@github.com:yuku123/z-opc-frontend.git` 独立维护。z-opc 仓库内的 `z-opc-frontend/` 不再使用。

完成后 z-opc 的 9 个 `_frontend/` 通过 `npm:@yuku123/z-frontend-common@^0.1.0` 引用，不再需要 file: 路径。

## 国内开发者加速

项目根 .npmrc 解开下一行注释：
```
@yuku123:registry=https://registry.npmmirror.com/
```

## License

MIT