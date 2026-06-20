/**
 * 兼容垫片: 从 @yuku123/z-frontend-common re-export
 * 历史上各业务页面的 import 路径是 '../../../utils/request'，保留这个 shim.
 */
export {request as default, authRequest, ctcRequest, createRequest, setupInterceptors} from '@yuku123/z-frontend-common'
