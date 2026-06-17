/**
 * z-frontend-common 组件库 - 导出所有可复用组件
 *
 * 命名导出 + 默认导出双形式：
 *   import { AppLayout, LoginPage, request, createRequest } from '@yuku123/z-frontend-common'
 *   import common from '@yuku123/z-frontend-common'
 */

// 组件
export {default as AppLayout} from './components/Layout'
export {default as StatusTag, defaultStatusMap} from './components/StatusTag'
export {default as LoginPage} from './components/LoginPage'
export {default as ErrorBoundary} from './components/ErrorBoundary'

// 请求工具：默认实例（baseURL=/api）+ 工厂
export {default as request} from './utils/request'
export {authRequest, createRequest, setupInterceptors} from './utils/request'

// 默认聚合对象
import _AppLayout from './components/Layout'
import _StatusTag, {defaultStatusMap as _defaultStatusMap} from './components/StatusTag'
import _LoginPage from './components/LoginPage'
import _ErrorBoundary from './components/ErrorBoundary'
import _request, {authRequest as _authRequest, createRequest as _createRequest} from './utils/request'

const common = {
    AppLayout: _AppLayout,
    StatusTag: _StatusTag,
    defaultStatusMap: _defaultStatusMap,
    LoginPage: _LoginPage,
    ErrorBoundary: _ErrorBoundary,
    request: _request,
    authRequest: _authRequest,
    createRequest: _createRequest,
}
export default common
