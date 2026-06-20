/**
 * z-ops 后端 API 客户端
 *
 * 后端端点:
 *   - DeploymentUnitController  (/api/ops/deployment)
 *   - DeploymentTargetController(/api/ops/target)
 *   - EnvironmentController     (/api/ops/environment)
 *   - DeploymentRecordController(/api/ops/record)
 *   - WebhookController         (/api/ops/webhook)
 *   - ImageController           (/api/image)
 *   - ImageTagController        (/api/ops/image-tag)
 *   - ImageBuildController      (/api/image-build)
 *
 * 后端返回 { code, data, msg } → 解包后返回 data
 */
import axios from 'axios'

let _baseURL = '/api'

export function configureApiBaseURL(baseURL) {
    _baseURL = baseURL || '/api'
}

function req() {
    return axios.create({baseURL: _baseURL, timeout: 10000})
}

/** 解包 { code, data, msg } */
const unwrap = (r) => {
    const d = r.data
    if (d && typeof d === 'object' && 'code' in d && 'data' in d) {
        if (d.code !== 0 && d.code !== 200) return Promise.reject(new Error(d.msg || d.message || '请求失败'))
        return d.data
    }
    return d
}

// ============ 部署单元 ============
export const deploymentUnitApi = {
    list: () => req().get('/ops/deployment/list').then(unwrap),
    get: (id) => req().get(`/ops/deployment/${id}`).then(unwrap),
    create: (data) => req().post('/ops/deployment', data).then(unwrap),
    update: (data) => req().put('/ops/deployment', data).then(unwrap),
    delete: (id) => req().delete(`/ops/deployment/${id}`).then(unwrap),
    deploy: (id) => req().post(`/ops/deployment/deploy/${id}`).then(unwrap),
    log: (id) => req().get(`/ops/deployment/log/${id}`).then(unwrap),
}

// ============ 部署目标 (渠道) ============
export const targetApi = {
    list: () => req().get('/ops/target/list').then(unwrap),
    get: (id) => req().get(`/ops/target/${id}`).then(unwrap),
    create: (data) => req().post('/ops/target', data).then(unwrap),
    update: (data) => req().put('/ops/target', data).then(unwrap),
    delete: (id) => req().delete(`/ops/target/${id}`).then(unwrap),
}

// ============ 环境管理 ============
export const environmentApi = {
    list: () => req().get('/ops/environment/list').then(unwrap),
    get: (id) => req().get(`/ops/environment/${id}`).then(unwrap),
    create: (data) => req().post('/ops/environment', data).then(unwrap),
    update: (data) => req().put('/ops/environment', data).then(unwrap),
    delete: (id) => req().delete(`/ops/environment/${id}`).then(unwrap),
}

// ============ 部署记录 ============
export const recordApi = {
    list: (unitId) => req().get('/ops/record/list', {params: unitId ? {unitId} : {}}).then(unwrap),
    get: (id) => req().get(`/ops/record/${id}`).then(unwrap),
}

// ============ Webhook ============
export const webhookApi = {
    list: (unitId) => req().get('/ops/webhook/list', {params: unitId ? {unitId} : {}}).then(unwrap),
    create: (data) => req().post('/ops/webhook', data).then(unwrap),
    update: (data) => req().put('/ops/webhook', data).then(unwrap),
    delete: (id) => req().delete(`/ops/webhook/${id}`).then(unwrap),
    url: (id) => req().get(`/ops/webhook/url/${id}`).then(unwrap),
}

// ============ 镜像管理 ============
export const imageApi = {
    page: (params) => req().post('/image/page', params).then(unwrap),
    list: () => req().get('/image/list').then(unwrap),
    get: (id) => req().get('/image/get', {params: {id}}).then(unwrap),
    add: (data) => req().post('/image', data).then(unwrap),
    update: (data) => req().post('/image/update', data).then(unwrap),
    delete: (id) => req().post('/image/delete', null, {params: {id}}).then(unwrap),
    tags: (imageId) => req().get('/image/tags', {params: {imageId}}).then(unwrap),
    addTag: (data) => req().post('/image/tag', data).then(unwrap),
    deleteTag: (id) => req().post('/image/tag/delete', null, {params: {id}}).then(unwrap),
}

// ============ 镜像版本 (ImageTagController) ============
export const imageTagApi = {
    list: (imageId) => req().get('/ops/image-tag/list', {params: {imageId}}).then(unwrap),
    create: (data) => req().post('/ops/image-tag', data).then(unwrap),
    delete: (id) => req().delete(`/ops/image-tag/${id}`).then(unwrap),
}

// ============ 镜像构建 ============
export const imageBuildApi = {
    page: (params) => req().post('/image-build/page', params).then(unwrap),
    list: () => req().get('/image-build/list').then(unwrap),
    get: (id) => req().get('/image-build/get', {params: {id}}).then(unwrap),
    add: (data) => req().post('/image-build', data).then(unwrap),
}

// ============ OSS (z-oss) ============
export const ossBucketApi = {
    list: () => req().get('/v1/bucket').then(unwrap),
}
