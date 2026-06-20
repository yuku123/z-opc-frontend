/**
 * 兼容垫片: 之前在 z-opc-main-starter-frontend/services/ 里的所有 axios 客户端
 * 这里直接 re-export z-frontend-common 的 utils/request, 并提供 makeApi 工具.
 */
import request, {authRequest, setupInterceptors} from '../utils/request'
export {request as default, authRequest, setupInterceptors}

function makeApi(name) {
    return {
        list: (params) => request.get(`/${name}/list`, {params}).then(r => r.data),
        page: (params) => request.get(`/${name}/page`, {params}).then(r => r.data),
        get: (id) => request.get(`/${name}/${id}`).then(r => r.data),
        create: (data) => request.post(`/${name}`, data).then(r => r.data),
        update: (id, data) => request.put(`/${name}/${id}`, data).then(r => r.data),
        delete: (id) => request.delete(`/${name}/${id}`).then(r => r.data),
    }
}

export const configApi = makeApi('config')
export const approvalApi = makeApi('approval')
export const designerApi = makeApi('designer')
export const mcpApi = makeApi('mcp')
export const mockPlatformApi = makeApi('mock')
export const namingApi = makeApi('naming')
export const opsApi = makeApi('ops')
export const ossApi = makeApi('oss')
export const scriptApi = makeApi('script')
export const skillApi = makeApi('skill')
export const agentApi = makeApi('agent')
export const flowApi = makeApi('flow')
export const traceApi = makeApi('trace')
export const llmApi = makeApi('llm')
export const productApi = makeApi('product')
export const sceneApi = makeApi('scene')
export const ctcAcAccountApi = makeApi('ctc/ac/accounts')
export const ctcAcLoginLogApi = makeApi('ctc/ac/login-log')
export const ctcAcTenantApi = makeApi('ctc/ac/tenants')
export const ctcAcDomainApi = makeApi('ctc/ac/domains')
export const ctcAcOrgApi = makeApi('ctc/ac/orgs')
export const ctcAcDeptApi = makeApi('ctc/ac/depts')
export const ctcAcGroupApi = makeApi('ctc/ac/groups')
export const ctcAuthorizationApi = makeApi('ctc/authorization')
export const metaAppApi = makeApi('meta-app')
export const jobApi = makeApi('schedule/job')
export const webideApi = makeApi('webide')
export const privateConfigApi = makeApi('private-config')
export const ctcSurlApi = makeApi('ctc/surl')
export const ctcUserApi = makeApi('ctc/user')
export const agentTeamApi = makeApi('agent/team')
export const workspaceApi = makeApi('agent/team/workspace')

// === 项目 / 任务 / 鉴权 ===
export const login = (data) => request.post('/ctc/auth/login', data).then(r => r.data)
export const getCurrentUser = () => {
    try { return Promise.resolve(JSON.parse(localStorage.getItem('userInfo') || 'null')) }
    catch { return Promise.resolve(null) }
}
export const switchTenant = (tenantCode, domainCode) =>
    authRequest.post('/ctc/auth/switch-tenant', {tenantCode: tenantCode || '', domainCode: domainCode || ''}).then(r => r.data)
export const listMyProjects = () => authRequest.get('/project/user/list').then(r => r.data)
export const createProject = (data) => request.post('/project', data).then(r => r.data)
export const updateProject = (id, data) => request.put(`/project/${id}`, data).then(r => r.data)
export const archiveProject = (id) => request.put(`/project/${id}/archive`).then(r => r.data)
export const listTasksByProject = (projectId) => request.get('/task/project/list', {params: {projectId}}).then(r => r.data)
export const createTask = (data) => request.post('/task', data).then(r => r.data)
export const completeTask = (id) => request.post('/task/complete', null, {params: {taskId: id}}).then(r => r.data)
export const moveTask = (taskId, targetListId, position) =>
    request.put('/task/move', null, {params: {taskId, targetListId, position}}).then(r => r.data)
export const listTasksByList = (listId) => request.get('/task/list', {params: {listId}}).then(r => r.data)
export const getDomainByTenantCode = async () => [{domainCode: 'default', domainName: '默认域'}]
export const getTenantList = async () => []
export const getDynamicMenu = async () => []
export const userOrgRelApi = {
    usersByDept: () => Promise.resolve([]),
    usersByGroup: () => Promise.resolve([]),
}
