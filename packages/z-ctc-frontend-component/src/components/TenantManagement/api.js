/**
 * z-ctc-ac 租户 / 域 API (FEATURE016 后端持久化).
 *
 * 后端端点 (z-ctc/z-ctc-ac):
 *   - TenantController   (/api/ctc/ac/tenants)  : create / getByCode / updateStatus / listAll
 *   - DomainController   (/api/ctc/ac/domains)  : listByTenant / listAll / getById / create / update / delete
 *
 * 数据模型字段:
 *   TenantDO: id, tenantCode, tenantName, status, description, createdAt, updatedAt
 *   DomainDO: id, domainCode, domainName, tenantCode, status, description, createdAt, updatedAt
 *
 * 注意: 后端返回 ResponseEntity<T> (不经过 {code,data,message} 解包),
 *      所以这里不使用 z-frontend-common 的 createRequest (它会解包),
 *      而是直接用 axios 拿到 res.data.
 */

import axios from 'axios'

let _baseURL = '/api'

export function configureApiBaseURL(baseURL) {
    _baseURL = baseURL || '/api'
}

function makeRequest() {
    return axios.create({baseURL: _baseURL, timeout: 15000})
}

// ========== Tenant (租户) ==========

export const ctcAcTenantApi = {
    /** POST /api/ctc/ac/tenants — 创建租户, 返回新 ID */
    create: (tenant) => makeRequest().post('/ctc/ac/tenants', tenant).then(r => r.data),

    /** GET /api/ctc/ac/tenants/{tenantCode} — 按 code 查询 */
    getByCode: (tenantCode) =>
        makeRequest().get(`/ctc/ac/tenants/${encodeURIComponent(tenantCode)}`).then(r => r.data),

    /** POST /api/ctc/ac/tenants/{tenantCode}/status?status=0|1 — 启/停用 */
    updateStatus: (tenantCode, status) =>
        makeRequest().post(`/ctc/ac/tenants/${encodeURIComponent(tenantCode)}/status`, null, {
            params: {status},
        }).then(r => r.data),

    /** GET /api/ctc/ac/tenants/list — 全量列表 */
    listAll: () => makeRequest().get('/ctc/ac/tenants/list').then(r => r.data),
}

// ========== Domain (域) ==========

export const ctcAcDomainApi = {
    /** GET /api/ctc/ac/domains/list?tenantCode=xxx — 租户下域列表 */
    listByTenant: (tenantCode) =>
        makeRequest().get('/ctc/ac/domains/list', {params: {tenantCode}}).then(r => r.data),

    /** GET /api/ctc/ac/domains/list-all — 全量 */
    listAll: () => makeRequest().get('/ctc/ac/domains/list-all').then(r => r.data),

    /** GET /api/ctc/ac/domains/{id} */
    getById: (id) => makeRequest().get(`/ctc/ac/domains/${id}`).then(r => r.data),

    /** POST /api/ctc/ac/domains — 创建, 返回新 ID */
    create: (domain) => makeRequest().post('/ctc/ac/domains', domain).then(r => r.data),

    /** PUT /api/ctc/ac/domains/{id} */
    update: (id, patch) => makeRequest().put(`/ctc/ac/domains/${id}`, patch).then(r => r.data),

    /** DELETE /api/ctc/ac/domains/{id} */
    delete: (id) => makeRequest().delete(`/ctc/ac/domains/${id}`).then(r => r.data),
}

export const ctcAcTenantDomainApi = {
    tenant: ctcAcTenantApi,
    domain: ctcAcDomainApi,
}

export default ctcAcTenantDomainApi
