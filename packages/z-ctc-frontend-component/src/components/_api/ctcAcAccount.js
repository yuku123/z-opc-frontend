/**
 * z-ctc-ac 账号 / 登录日志 API (从 z-opc-main-starter-frontend/src/services/ctcAc 迁入).
 *
 * 后端端点 (z-ctc/z-ctc-ac):
 *   - AccountController  (/api/ctc/ac/accounts)  : 5 endpoints
 *   - LoginLogController (/api/ctc/ac/login-log) : 1 endpoint
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

export const ctcAcAccountApi = {
    /** POST /api/ctc/ac/accounts — 创建账号, 返回新 ID */
    create: (req) => makeRequest().post('/ctc/ac/accounts', req).then(r => r.data),

    /** GET /api/ctc/ac/accounts/{id} */
    getById: (id) => makeRequest().get(`/ctc/ac/accounts/${id}`).then(r => r.data),

    /** GET /api/ctc/ac/accounts?tenant=&pageNum=&pageSize= */
    listByTenant: (params) => makeRequest().get('/ctc/ac/accounts', {params}).then(r => r.data),

    /** POST /api/ctc/ac/accounts/{id}/status?status=0|1 */
    updateStatus: (id, status) => makeRequest().post(`/ctc/ac/accounts/${id}/status`, null, {
        params: {status},
    }).then(r => r.data),

    /** POST /api/ctc/ac/accounts/{id}/password/change */
    changePassword: (id, req) => makeRequest().post(`/ctc/ac/accounts/${id}/password/change`, req).then(r => r.data),

    /** POST /api/ctc/ac/accounts/{id}/password/reset */
    resetPassword: (id, req) => makeRequest().post(`/ctc/ac/accounts/${id}/password/reset`, req).then(r => r.data),
}

export const ctcAcLoginLogApi = {
    /** POST /api/ctc/ac/login-log/list — 分页查询登录日志 */
    list: (params) => makeRequest().post('/ctc/ac/login-log/list', params).then(r => r.data),
}

export default ctcAcAccountApi
