/**
 * 路由表: 把 agentApi / flowApi / llmApi / mcpApi / scriptApi / skillApi /
 * productApi / sceneApi / ossApi 方法名映射到真实后端 endpoint。
 *
 * 移植自主壳 src/services/apiRouter.ts，只保留本包页面实际用到的 Api。
 * 未命中 → 返空响应（不影响 build）。
 */
import {reg} from './apiRouter.js'

// =============================================================
// llmApi (LLM 模型)
// =============================================================
reg('llmApi', 'knowledgeList', 'GET', '/llm-gateway/knowledge/list')
reg('llmApi', 'skillTemplateList', 'GET', '/llm-gateway/skill/template-list')
reg('llmApi', 'toolTemplateList', 'GET', '/llm-gateway/tool/template-list')
reg('llmApi', 'appConfig', 'GET', '/llm-gateway/app/config')
reg('llmApi', 'appSkillAdd', 'POST', '/llm-gateway/app/skill-add')
reg('llmApi', 'appToolAdd', 'POST', '/llm-gateway/app/tool-add')

// =============================================================
// mcpApi
// =============================================================
reg('mcpApi', 'list', 'GET', '/mcp/server/list')
reg('mcpApi', 'listTools', 'POST', '/mcp/server/tools/list')
reg('mcpApi', 'callTool', 'POST', '/mcp/server/tools/call')
reg('mcpApi', 'test', 'POST', '/mcp/server/test')
reg('mcpApi', 'create', 'POST', '/mcp/server')
reg('mcpApi', 'update', 'POST', '/mcp/server/update')
reg('mcpApi', 'delete', 'POST', '/mcp/server/delete')

// =============================================================
// ossApi (对象存储 z-oss)
// =============================================================
reg('ossApi', 'listBuckets', 'GET', '/v1/bucket')
reg('ossApi', 'getBucketStats', 'GET', '/v1/bucket/{bucketName}/stats')
reg('ossApi', 'createBucket', 'POST', '/v1/bucket')
reg('ossApi', 'deleteBucket', 'DELETE', '/v1/bucket/{bucketName}')
reg('ossApi', 'setBucketAcl', 'PUT', '/v1/bucket/{bucketName}/acl')
reg('ossApi', 'listObjects', 'GET', '/v1/object/{bucketName}')
reg('ossApi', 'presignedUrl', 'GET', '/v1/object/{bucketName}/{objectKey}/url')
reg('ossApi', 'uploadObject', 'POST', '/v1/object/{bucketName}/{objectKey}')
reg('ossApi', 'downloadUrl', 'GET', '/v1/object/{bucketName}/{objectKey}/url')
reg('ossApi', 'deleteObject', 'DELETE', '/v1/object/{bucketName}/{objectKey}')
reg('ossApi', 'copyObject', 'POST', '/v1/object/{bucketName}/{objectKey}/copy')
reg('ossApi', 'batchDelete', 'POST', '/v1/object/{bucketName}/batch-delete')
reg('ossApi', 'createFolder', 'POST', '/v1/folder/{bucketName}/{folderKey}')

// =============================================================
// scriptApi (脚本中心)
// =============================================================
reg('scriptApi', 'list', 'GET', '/script/list')
reg('scriptApi', 'create', 'POST', '/script')
reg('scriptApi', 'update', 'POST', '/script/update')
reg('scriptApi', 'delete', 'POST', '/script/delete')
reg('scriptApi', 'publish', 'POST', '/script/publish')
reg('scriptApi', 'unpublish', 'POST', '/script/unpublish')
reg('scriptApi', 'run', 'POST', '/script/run')
reg('scriptApi', 'importCurl', 'POST', '/script/import-curl')
reg('scriptApi', 'importOpenApi', 'POST', '/script/import-openapi')
reg('scriptApi', 'previewMapping', 'POST', '/script/preview-mapping')

// =============================================================
// skillApi (技能市场)
// =============================================================
reg('skillApi', 'page', 'GET', '/skill/page')
reg('skillApi', 'categoryTree', 'GET', '/skill/category-tree')
reg('skillApi', 'create', 'POST', '/skill')
reg('skillApi', 'createCategory', 'POST', '/skill/category')
reg('skillApi', 'deleteCategory', 'POST', '/skill/category/delete')
reg('skillApi', 'getBySkillCode', 'GET', '/skill/by-code')
reg('skillApi', 'install', 'POST', '/skill/install')
reg('skillApi', 'stats', 'GET', '/skill/stats')
reg('skillApi', 'versions', 'GET', '/skill/versions')
reg('skillApi', 'downloadPackage', 'GET', '/skill/download')
reg('skillApi', 'uploadPackage', 'POST', '/skill/upload')

// =============================================================
// agentApi (Agent 应用)
// =============================================================
reg('agentApi', 'appPage', 'POST', '/agent/app/page')
reg('agentApi', 'appGet', 'GET', '/agent/app/get')
reg('agentApi', 'appCreate', 'POST', '/agent/app')
reg('agentApi', 'appUpdate', 'POST', '/agent/app/update')
reg('agentApi', 'appDelete', 'POST', '/agent/app/delete')
reg('agentApi', 'appPublish', 'POST', '/agent/app/publish')
reg('agentApi', 'appUpgrade', 'POST', '/agent/app/upgrade')
reg('agentApi', 'appToggleShare', 'POST', '/agent/app/toggleShare')
reg('agentApi', 'versions', 'GET', '/agent/app/versions')
reg('agentApi', 'groupTree', 'GET', '/agent/group/tree')
reg('agentApi', 'groupCreate', 'POST', '/agent/group')
reg('agentApi', 'groupUpdate', 'POST', '/agent/group/update')
reg('agentApi', 'groupDelete', 'POST', '/agent/group/delete')
reg('agentApi', 'chatHistory', 'GET', '/agent/chat/history')
reg('agentApi', 'chatStream', 'POST', '/agent/chat/send')
reg('agentApi', 'chatClear', 'POST', '/agent/chat/clear')
reg('agentApi', 'shareVerify', 'GET', '/agent/share/verify')

// =============================================================
// flowApi (Agent 工作流 FEATURE013 A5)
// =============================================================
reg('flowApi', 'list', 'GET', '/agent/flow/list')
reg('flowApi', 'get', 'GET', '/agent/flow/{id}')
reg('flowApi', 'byFlowId', 'GET', '/agent/flow/byFlowId')
reg('flowApi', 'versions', 'GET', '/agent/flow/versions')
reg('flowApi', 'create', 'POST', '/agent/flow/create')
reg('flowApi', 'update', 'POST', '/agent/flow/update')
reg('flowApi', 'publish', 'POST', '/agent/flow/publish/{id}')
reg('flowApi', 'archive', 'POST', '/agent/flow/archive/{id}')
reg('flowApi', 'newVersion', 'POST', '/agent/flow/newVersion/{parentId}')
reg('flowApi', 'delete', 'POST', '/agent/flow/delete/{id}')
reg('flowApi', 'execute', 'POST', '/agent/flow/execute/{id}')
reg('flowApi', 'health', 'GET', '/agent/flow/health')

// =============================================================
// productApi (产品中心)
// =============================================================
reg('productApi', 'page', 'GET', '/v1/products')
reg('productApi', 'create', 'POST', '/v1/products')
reg('productApi', 'update', 'PUT', '/v1/products/{id}')
reg('productApi', 'delete', 'DELETE', '/v1/products/{id}')
reg('productApi', 'publish', 'POST', '/v1/products/{id}/publish')
reg('productApi', 'offline', 'POST', '/v1/products/{id}/offline')
reg('productApi', 'configGet', 'GET', '/v1/products/{id}/config')
reg('productApi', 'configSave', 'PUT', '/v1/products/{id}/config')

// =============================================================
// sceneApi (场景编排)
// =============================================================
reg('sceneApi', 'page', 'GET', '/v1/scenes')
reg('sceneApi', 'create', 'POST', '/v1/scenes')
reg('sceneApi', 'update', 'PUT', '/v1/scenes/{id}')
reg('sceneApi', 'delete', 'DELETE', '/v1/scenes/{id}')
reg('sceneApi', 'duplicate', 'POST', '/v1/scenes/{id}/duplicate')
reg('sceneApi', 'publish', 'POST', '/v1/scenes/{id}/publish')
reg('sceneApi', 'offline', 'POST', '/v1/scenes/{id}/offline')
reg('sceneApi', 'execute', 'POST', '/v1/scenes/{id}/execute')
reg('sceneApi', 'canvasGet', 'GET', '/v1/scenes/{id}/canvas')
reg('sceneApi', 'configGet', 'GET', '/v1/scenes/{id}/config')
reg('sceneApi', 'nodes', 'GET', '/v1/scenes/{id}/nodes')
reg('sceneApi', 'chatHistory', 'GET', '/v1/scenes/{id}/chat-history')
