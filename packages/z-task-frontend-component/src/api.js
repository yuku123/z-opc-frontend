/**
 * z-task 任务 / 项目 API (从 z-opc-main-starter-frontend/src/services/api.ts 迁入).
 *
 * 后端端点 (z-task):
 *   - GET    /api/project/user/list     — 我的项目列表
 *   - POST   /api/project              — 创建项目
 *   - PUT    /api/project/{id}         — 更新项目
 *   - PUT    /api/project/{id}/archive — 归档
 *   - GET    /api/task/project/list?projectId=  — 项目下任务
 *   - POST   /api/task                 — 创建任务
 *   - PUT    /api/task/move            — 移动任务
 *   - POST   /api/task/complete?taskId= — 完成任务
 *
 * 注意: 走 z-frontend-common 的 createRequest (统一拦截 + Result 解包),
 *      而不是裸 axios. 这样后端 Result 包装 {code, data, message} 会被自动解包.
 */

import {createRequest, authRequest} from '@yuku123/z-frontend-common'

const request = createRequest('task')

export const taskApi = {
    // === 项目 ===
    listMyProjects: () => authRequest.get('/project/user/list').then(r => r.data),
    createProject: (data) => request.post('/project', data).then(r => r.data),
    updateProject: (id, data) => request.put(`/project/${id}`, data).then(r => r.data),
    archiveProject: (id) => request.put(`/project/${id}/archive`).then(r => r.data),

    // === 任务 ===
    listTasksByProject: (projectId) => request.get('/task/project/list', {params: {projectId}}).then(r => r.data),
    listTasksByList: (listId) => request.get('/task/list', {params: {listId}}).then(r => r.data),
    createTask: (data) => request.post('/task', data).then(r => r.data),
    completeTask: (id) => request.post('/task/complete', null, {params: {taskId: id}}).then(r => r.data),
    moveTask: (taskId, targetListId, position) =>
        request.put('/task/move', null, {params: {taskId, targetListId, position}}).then(r => r.data),
}

export default taskApi
