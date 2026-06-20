/**
 * z-meta 应用 API (从 z-opc-main-starter-frontend/src/services/metaApp 迁入).
 *
 * 后端端点 (z-meta):
 *   - MetaApplicationController (/api/meta-app/*) : 应用 CRUD + 分页查询
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

export const metaAppApi = {
    /** GET /api/meta-app/list — 分页查询 */
    listApplications: (params) => makeRequest().get('/meta-app/list', {params}).then(r => r.data),

    /** GET /api/meta-app/{id} */
    getApplication: (id) => makeRequest().get(`/meta-app/${id}`).then(r => r.data),

    /** POST /api/meta-app */
    create: (app) => makeRequest().post('/meta-app', app).then(r => r.data),

    /** PUT /api/meta-app/{id} */
    update: (id, patch) => makeRequest().put(`/meta-app/${id}`, patch).then(r => r.data),

    /** DELETE /api/meta-app/{id} */
    delete: (id) => makeRequest().delete(`/meta-app/${id}`).then(r => r.data),
}

export default metaAppApi
