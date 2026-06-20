/**
 * z-ctc-authorization 资源 / 角色 API (从 z-opc-main-starter-frontend/src/services/ctcAuthorization 迁入).
 *
 * 后端端点 (z-ctc/z-ctc-authorization):
 *   - AuthorizationController  (/api/ctc/authorization)  : 资源/角色/授权 全部端点
 *
 * 注意: 后端返回 ResponseEntity<T> (不做 Result 解包).
 */

import axios from 'axios'

let _baseURL = '/api'

export function configureApiBaseURL(baseURL) {
    _baseURL = baseURL || '/api'
}

function makeRequest() {
    return axios.create({baseURL: _baseURL, timeout: 15000})
}

export const ctcAuthorizationApi = {
    // ── 资源 (Resource) ──
    listResourcesByApp: (params) => makeRequest().get('/ctc/authorization/resources', {params}).then(r => r.data),
    getResource: (id) => makeRequest().get(`/ctc/authorization/resources/${id}`).then(r => r.data),
    createResource: (resource) => makeRequest().post('/ctc/authorization/resources', resource).then(r => r.data),
    updateResource: (id, patch) => makeRequest().put(`/ctc/authorization/resources/${id}`, patch).then(r => r.data),
    deleteResource: (id) => makeRequest().delete(`/ctc/authorization/resources/${id}`).then(r => r.data),

    // 资源-角色关系
    listResourceRoles: (resourceId) => makeRequest().get(`/ctc/authorization/resources/${resourceId}/roles`).then(r => r.data),
    grantRoleResource: (roleId, resourceId) => makeRequest().post(`/ctc/authorization/roles/${roleId}/resources/${resourceId}`).then(r => r.data),
    revokeRoleResource: (roleId, resourceId) => makeRequest().delete(`/ctc/authorization/roles/${roleId}/resources/${resourceId}`).then(r => r.data),

    // ── 角色 (Role) ──
    listAllRoles: () => makeRequest().get('/ctc/authorization/roles/list').then(r => r.data),
    getRole: (id) => makeRequest().get(`/ctc/authorization/roles/${id}`).then(r => r.data),
    createRole: (role) => makeRequest().post('/ctc/authorization/roles', role).then(r => r.data),
    updateRole: (id, patch) => makeRequest().put(`/ctc/authorization/roles/${id}`, patch).then(r => r.data),
    deleteRole: (id) => makeRequest().delete(`/ctc/authorization/roles/${id}`).then(r => r.data),
}

export default ctcAuthorizationApi
