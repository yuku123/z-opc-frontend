/**
 * z-ops 共享前端组件库 - 导出所有可复用页面组件
 * 打包后发布到 npm，供 z-opc-main-starter-frontend 等 shell 应用使用
 *
 * 使用方式:
 *   import { ChannelPage, DeliveryPage, ... } from '@yuku123/z-ops-frontend-component'
 */

// 运维中心 - 直挂页面
export {default as ChannelPage} from './components/ChannelPage'       // 渠道管理 (DeploymentTarget CRUD)
export {default as DeliveryPage} from './components/DeliveryPage'     // 环境管理 (Environment CRUD)
export {default as DeploymentPage} from './components/DeploymentPage' // 部署单元 (DeploymentUnit CRUD + deploy)
export {default as TaskPage} from './components/TaskPage'             // 部署记录 (DeploymentRecord list)

// 资源管理
export {default as ResourceOssPage} from './components/ResourceOssPage' // OSS Bucket 列表
export {default as DomainPage} from './components/DomainPage'           // 域名管理 (占位)
export {default as EcsPage} from './components/EcsPage'                 // ECS 管理 (占位)
export {default as RdsPage} from './components/RdsPage'                 // RDS 管理 (占位)

// 研发协同
export {default as RdOpsPage} from './components/RdOpsPage'   // 镜像构建记录
export {default as SprintPage} from './components/SprintPage' // 迭代管理 (占位)

// API 客户端 (供外部自定义扩展)
export {
    configureApiBaseURL,
    deploymentUnitApi,
    targetApi,
    environmentApi,
    recordApi,
    webhookApi,
    imageApi,
    imageTagApi,
    imageBuildApi,
    ossBucketApi,
} from './api'
