/** job service stub (从 z-opc-main-starter-frontend/services/job.ts 迁入) */
import request, {authRequest, setupInterceptors} from '../utils/request'
export {request as default, authRequest, setupInterceptors}

function makeJobApi() {
    return {
        list: () => request.get('/schedule/job/list').then(r => r.data),
        page: (params) => request.get('/schedule/job/page', {params}).then(r => r.data),
        get: (id) => request.get(`/schedule/job/${id}`).then(r => r.data),
        create: (data) => request.post('/schedule/job', data).then(r => r.data),
        update: (id, data) => request.put(`/schedule/job/${id}`, data).then(r => r.data),
        delete: (id) => request.delete(`/schedule/job/${id}`).then(r => r.data),
        run: (id) => request.post(`/schedule/job/${id}/run`).then(r => r.data),
        pause: (id) => request.post(`/schedule/job/${id}/pause`).then(r => r.data),
        resume: (id) => request.post(`/schedule/job/${id}/resume`).then(r => r.data),
    }
}

export const jobApi = makeJobApi()
export const dashboardApi = makeJobApi()
