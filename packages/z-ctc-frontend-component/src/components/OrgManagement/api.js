/**
 * z-ctc-ac 组织 / 部门 / 组别 API (FEATURE016 后端持久化).
 *
 * 后端 16 端点 (z-ctc/z-ctc-ac/OrgController @ /api/ctc/ac):
 *   - /orgs  POST / GET(list) / GET(code) / PUT(code) / DELETE(code) / GET(health)
 *   - /depts POST / GET(list) / GET(code) / PUT(code) / DELETE(code)
 *   - /groups POST / GET(list) / GET(code) / PUT(code) / DELETE(code)
 *
 * 数据模型字段:
 *   id, tenantCode, domainCode, orgCode, orgName, status, description, extConfig,
 *   createdAt, createdBy, updatedAt, updatedBy
 *
 * 注意: 后端返回 ResponseEntity<T> (不经过 {code,data,message} 解包),
 *      所以这里不使用 z-frontend-common 的 createRequest (它会解包),
 *      而是直接用 axios 拿到 res.data.
 *
 * 租户 / 域 由组件使用者通过 props 传入 (本组件不耦合 z-meta).
 */

import axios from 'axios'

let _baseURL = '/api'

export function configureApiBaseURL(baseURL) {
    _baseURL = baseURL || '/api'
}

function makeRequest() {
    return axios.create({baseURL: _baseURL, timeout: 15000})
}

// ========== Org (组织) ==========

export const ctcAcOrgApi = {
    /** POST /api/ctc/ac/orgs — 创建组织, 返回新 ID */
    create: (org) => makeRequest().post('/ctc/ac/orgs', org).then(r => r.data),

    /** GET /api/ctc/ac/orgs/list?tenantCode=&domainCode= — 按域列出组织 */
    listByDomain: (tenantCode, domainCode) =>
        makeRequest().get('/ctc/ac/orgs/list', {params: {tenantCode, domainCode}}).then(r => r.data),

    /** GET /api/ctc/ac/orgs/{orgCode}?tenantCode=&domainCode= — 按编码查询 */
    getByCode: (tenantCode, domainCode, orgCode) =>
        makeRequest().get(`/ctc/ac/orgs/${encodeURIComponent(orgCode)}`, {params: {tenantCode, domainCode}}).then(r => r.data),

    /** PUT /api/ctc/ac/orgs/{orgCode}?tenantCode=&domainCode= — 更新 */
    update: (tenantCode, domainCode, orgCode, patch) =>
        makeRequest().put(`/ctc/ac/orgs/${encodeURIComponent(orgCode)}`, patch, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),

    /** DELETE /api/ctc/ac/orgs/{orgCode}?tenantCode=&domainCode= — 删除 */
    delete: (tenantCode, domainCode, orgCode) =>
        makeRequest().delete(`/ctc/ac/orgs/${encodeURIComponent(orgCode)}`, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),
}

// ========== Dept (部门) ==========

export const ctcAcDeptApi = {
    create: (dept) => makeRequest().post('/ctc/ac/depts', dept).then(r => r.data),

    listByOrg: (tenantCode, domainCode, orgCode) =>
        makeRequest().get('/ctc/ac/depts/list', {params: {tenantCode, domainCode, orgCode}}).then(r => r.data),

    getByCode: (tenantCode, domainCode, deptCode) =>
        makeRequest().get(`/ctc/ac/depts/${encodeURIComponent(deptCode)}`, {params: {tenantCode, domainCode}}).then(r => r.data),

    update: (tenantCode, domainCode, deptCode, patch) =>
        makeRequest().put(`/ctc/ac/depts/${encodeURIComponent(deptCode)}`, patch, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),

    delete: (tenantCode, domainCode, deptCode) =>
        makeRequest().delete(`/ctc/ac/depts/${encodeURIComponent(deptCode)}`, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),
}

// ========== Group (组别) ==========

export const ctcAcGroupApi = {
    create: (group) => makeRequest().post('/ctc/ac/groups', group).then(r => r.data),

    listByDept: (tenantCode, domainCode, deptCode) =>
        makeRequest().get('/ctc/ac/groups/list', {params: {tenantCode, domainCode, deptCode}}).then(r => r.data),

    getByCode: (tenantCode, domainCode, groupCode) =>
        makeRequest().get(`/ctc/ac/groups/${encodeURIComponent(groupCode)}`, {params: {tenantCode, domainCode}}).then(r => r.data),

    update: (tenantCode, domainCode, groupCode, patch) =>
        makeRequest().put(`/ctc/ac/groups/${encodeURIComponent(groupCode)}`, patch, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),

    delete: (tenantCode, domainCode, groupCode) =>
        makeRequest().delete(`/ctc/ac/groups/${encodeURIComponent(groupCode)}`, {
            params: {tenantCode, domainCode},
        }).then(r => r.data),
}

export const ctcAcOrgDeptGroupApi = {
    org: ctcAcOrgApi,
    dept: ctcAcDeptApi,
    group: ctcAcGroupApi,
}

export default ctcAcOrgDeptGroupApi