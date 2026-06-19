# @yuku123/z-agent-frontend-component

z-opc 平台 Agent 模块共享前端组件包，封装了 Agent 应用、编辑器、工作流编排、LLM 管理、AK 管理、MCP、OSS、Skill、Script、Product、Usage 等页面级组件。

## 安装

```bash
npm install @yuku123/z-agent-frontend-component
```

## 入口

包内所有页面组件以命名导出形式暴露在包根入口。

```js
import {
    AgentAppPage,        // Agent 应用列表（/ai/agent/app）
    AgentAppEditor,      // Agent 应用编辑器
    AgentSharePage,      // Agent 公开分享页（/share/:shareCode）
    WorkflowEditor,      // LogicFlow 工作流编辑器
    ModelManage,         // LLM 模型管理
    LlmProvider,         // LLM 供应商
    LlmModel,            // LLM 模型列表
    AkManage,            // AK / 用量管理
    McpPage,             // MCP 中心
    BucketList,          // OSS Bucket 列表
    ObjectBrowser,       // OSS 对象浏览器
    ScriptCenterPage,    // 脚本中心
    ApiBridgeEditor,
    SkillMarket,         // 技能市场
    ProductList,         // Product 列表
    ProductExecute,      // Product 执行
    ProductScene,        // Product 场景
    UsageDashboard,      // 用量统计
    agentApi,            // Agent API 客户端
    flowApi,             // 工作流 API 客户端
    llmApi,              // LLM API 客户端
} from '@yuku123/z-agent-frontend-component'

// 也可以单独引入 API 客户端
import {agentApi, flowApi, llmApi} from '@yuku123/z-agent-frontend-component/api'
```

## Peer dependencies

需要宿主应用自行安装以下依赖（与 z-opc 主壳一致）：

- `react@^19.2.0`
- `react-dom@^19.2.0`
- `antd@^6.3.3`
- `@ant-design/icons@^6.1.0`
- `react-router-dom@^7.13.1`
- `react-markdown@^10.1.0`
- `remark-gfm@^4.0.1`
- `@logicflow/core@^2.2.3`
- `@logicflow/extension@^2.2.3`
- `@yuku123/z-frontend-common@^0.1.1`

## 本地开发

```bash
cd packages/z-agent-frontend-component
npm install
npm run dev       # 独立 dev playground
npm run build     # 产出 dist/z-agent-frontend-component.{es,umd}.js
```
