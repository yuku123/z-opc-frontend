/**
 * CTC 组件库 - 导出所有可复用组件
 * 打包后发布到私有npm仓库，供其他模块使用
 */
export {default as UserTable} from './components/UserTable'
export {default as StatusTag} from './components/StatusTag'

// 组织 / 部门 / 组 管理 (FEATURE016) — 业务组件 (需要传 tenants/domains props)
export {default as OrgManagement} from './components/OrgManagement'

// 4A 中心各域管理页 (FEATURE015+ 后从 z-opc-main-starter-frontend 迁入)
//   - 自带租户/域/应用拉取, 不依赖外部 store
//   - 走统一的 ctcRequest / ctcAc / ctcAuthorization / metaApp 后端
export {default as OrgPage} from './components/OrgPage'
export {default as TenantManagement} from './components/TenantManagement'
export {default as AccountManagement} from './components/AccountManagement'
export {default as ApplicationManagement} from './components/ApplicationManagement'
export {default as RoleManagement} from './components/RoleManagement'
export {default as PermissionManagement} from './components/PermissionManagement'
export {default as SurlManagement} from './components/SurlManagement'
