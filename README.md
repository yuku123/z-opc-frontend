# @yuku123/z-opc-frontend

> z-opc 共享前端组件工作区 · npm monorepo

4 个独立可发布的 React 组件包，统一在这里构建、版本、发布。

## 包清单

| 包 | 用途 | 版本 |
|---|---|---|
| [@yuku123/z-frontend-common](./packages/z-frontend-common) | AppLayout / StatusTag / LoginPage / ErrorBoundary + 统一 createRequest 工厂 | 0.1.0 |
| [@yuku123/z-wf-frontend-component](./packages/z-wf-frontend-component) | FlowDesigner 流程设计器（LogicFlow） | 0.1.0 |
| [@yuku123/z-ctc-frontend-component](./packages/z-ctc-frontend-component) | CTC 模块共享组件 | 0.1.0 |
| [@yuku123/z-task-frontend-component](./packages/z-task-frontend-component) | Task 模块共享组件 | 0.1.0 |

## 目录结构

```
z-opc-frontend/
├── package.json              # workspaces 根
├── .npmrc                    # registry 配置
├── .github/workflows/        # CI/CD
│   ├── ci.yml                # PR 触发 build 验证
│   └── publish.yml           # tag 触发 publish
├── scripts/
│   ├── publish-all.sh        # 本地一键发 4 个包
│   └── release.sh            # 升级版本号 + git tag
└── packages/
    ├── z-frontend-common/
    ├── z-wf-frontend-component/
    ├── z-ctc-frontend-component/
    └── z-task-frontend-component/
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

## 发新版本（推荐用 GitHub Actions）

```bash
# 1. 改代码
# 2. 升级版本号 + 打 tag
bash scripts/release.sh patch    # 0.1.0 → 0.1.1
bash scripts/release.sh minor    # 0.1.0 → 0.2.0
bash scripts/release.sh major    # 0.1.0 → 1.0.0

# 3. push tag → CI 自动 build + publish
git push origin main --tags
```

## 本地手动发（不推荐，仅调试用）

```bash
# 确保已 npm login
bash scripts/publish-all.sh
```

## 长期方案：拆出独立仓库

当前 `z-opc-frontend/` 是 z-opc monorepo 的子目录。下一步要拆成独立 repo：

```bash
# 在 z-opc 根目录跑（保留 git history）：
git subtree split -P z-opc-frontend -b z-opc-frontend-only

# 在 GitHub 上新建 yuku123/z-opc-frontend
gh repo create yuku123/z-opc-frontend --public

# 把 z-opc-frontend-only 分支 push 上去
git remote add upstream git@github.com:yuku123/z-opc-frontend.git
git push upstream z-opc-frontend-only:main

# z-opc 仓库保留 z-opc-frontend/ 作为 git submodule 或继续放在子树
```

完成后 z-opc 的 9 个 `_frontend/` 通过 `npm:@yuku123/z-frontend-common@^0.1.0` 引用，不再需要 file: 路径。

## 国内开发者加速

项目根 .npmrc 解开下一行注释：
```
@yuku123:registry=https://registry.npmmirror.com/
```

## License

MIT
