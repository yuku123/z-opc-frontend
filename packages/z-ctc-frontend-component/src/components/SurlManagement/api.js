/**
 * z-ctc-surl 短链 API (从 z-opc-main-starter-frontend/src/services/ctcSurl 迁入).
 *
 * 后端 (z-ctc/z-ctc-surl):
 *   - POST   /api/ctc/surl/shorten              — 生成短码
 *   - GET    /api/ctc/surl/{mapKey}/info        — 查询元信息
 *   - DELETE /api/ctc/surl/{mapKey}             — 失效
 *
 * 注意: 后端返回 ResponseEntity<T> (不做 Result 解包),
 *      所以这里直接用 axios 拿到 res.data.
 */

import axios from 'axios'

let _baseURL = '/api'

export function configureApiBaseURL(baseURL) {
    _baseURL = baseURL || '/api'
}

function makeRequest() {
    return axios.create({baseURL: _baseURL, timeout: 15000})
}

export const ctcSurlApi = {
    /** POST /api/ctc/surl/shorten */
    shorten: (req) => makeRequest().post('/ctc/surl/shorten', req).then(r => r.data),

    /** GET /api/ctc/surl/{mapKey}/info */
    info: (mapKey) => makeRequest().get(`/ctc/surl/${encodeURIComponent(mapKey)}/info`).then(r => r.data),

    /** DELETE /api/ctc/surl/{mapKey} */
    invalidate: (mapKey) => makeRequest().delete(`/ctc/surl/${encodeURIComponent(mapKey)}`).then(r => r.data),

    /** 前端拼接短链 (短码 → 完整 URL) */
    buildUrl: (mapKey) => {
        const base = (typeof window !== 'undefined' && window.location && window.location.origin) || ''
        return `${base}/s/${encodeURIComponent(mapKey)}`
    },
}

export default ctcSurlApi
