/**
 * z-agent-frontend-component 包入口
 *
 * 命名导出所有 agent / llm / mcp / oss / skill / script / product / scene 页面组件。
 * 与主壳 src/pages/ai/* 一一对应：
 *   - AgentAppPage       -> Agent 应用列表（/ai/agent/app）
 *   - AgentAppEditor     -> Agent 应用编辑器
 *   - AgentSharePage     -> Agent 公开分享页（/share/:shareCode）
 *   - WorkflowEditor     -> LogicFlow 工作流编辑器
 *   - ModelManage        -> LLM 模型管理（/ai/llm）
 *   - LlmProvider        -> LLM 供应商（/ai/llm/provider）
 *   - LlmModel           -> LLM 模型列表（/ai/llm/model）
 *   - AkManage           -> AK 管理（/ai/ak）
 *   - AkUsageDrawer      -> AK 用量抽屉
 *   - McpPage            -> MCP 中心（/ai/mcp）
 *   - BucketList         -> OSS Bucket 列表（/ai/oss/bucket）
 *   - ObjectBrowser      -> OSS 对象浏览器（/ai/oss/bucket/:bucketName）
 *   - ScriptCenterPage   -> 脚本中心（/ai/script）
 *   - ApiBridgeEditor    -> 脚本中心 - API 网桥编辑器
 *   - CurlImportModal    -> 脚本中心 - Curl 导入弹窗
 *   - OpenApiImportModal -> 脚本中心 - OpenAPI 导入弹窗
 *   - FieldMappingEditor -> 脚本中心 - 字段映射编辑器
 *   - SkillMarket        -> 技能市场（/ai/skill）
 *   - ProductList        -> 产品中心（/ai/product）
 *   - ProductExecute     -> 产品执行（/ai/product/execute）
 *   - ProductScene       -> 产品场景（/ai/product/scene）
 *   - UsageDashboard     -> 用量统计（/ai/usage）
 */

// Agent 应用 + 编辑器 + 工作流
export {default as AgentAppPage} from './pages/agent/index.jsx'
export {default as AgentAppList} from './pages/agent/app/index.jsx'
export {default as AgentAppEditor} from './pages/agent/editor/AgentAppEditor.jsx'
export {default as AgentSharePage} from './pages/agent/share.jsx'
export {default as WorkflowEditor} from './pages/agent/editor/WorkflowEditor.jsx'

// LLM 模型 / 供应商 / 模型列表
export {default as ModelManage} from './pages/llm/index.jsx'
export {default as LlmProvider} from './pages/llm/provider/index.jsx'
export {default as LlmModel} from './pages/llm/model/index.jsx'

// AK 管理
export {default as AkManage} from './pages/ak/index.jsx'
export {default as AkUsageDrawer} from './pages/ak/AkUsageDrawer.jsx'

// MCP 中心
export {default as McpPage} from './pages/mcp/index.jsx'

// OSS 对象存储
export {default as BucketList} from './pages/oss/BucketList.jsx'
export {default as ObjectBrowser} from './pages/oss/ObjectBrowser.jsx'

// 脚本中心
export {default as ScriptCenterPage} from './pages/script/index.jsx'
export {default as ApiBridgeEditor} from './pages/script/ApiBridgeEditor.jsx'
export {default as CurlImportModal} from './pages/script/CurlImportModal.jsx'
export {default as OpenApiImportModal} from './pages/script/OpenApiImportModal.jsx'
export {default as FieldMappingEditor} from './pages/script/FieldMappingEditor.jsx'

// 技能市场
export {default as SkillMarket} from './pages/skill/index.jsx'

// 产品中心
export {default as ProductList} from './pages/product/index.jsx'
export {default as ProductExecute} from './pages/product/execute.jsx'
export {default as ProductScene} from './pages/product/scene.jsx'

// 用量统计
export {default as UsageDashboard} from './pages/usage/index.jsx'

// API 客户端（也支持从 '@yuku123/z-agent-frontend-component/api' 单独 import）
export {
    agentApi,
    flowApi,
    llmApi,
    mcpApi,
    scriptApi,
    skillApi,
    productApi,
    sceneApi,
    ossApi,
    authRequest,
    ctcRequest,
} from './api/index.js'
import request from './api/index.js'
export {request}
