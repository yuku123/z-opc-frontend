/**
 * 智能路由器：依据路由表把 agentApi.xxx() 翻译成真实的 HTTP 请求。
 * 移植自主壳 src/services/apiRouter.ts (FEATURE015)，保持兼容。
 */
import request, {authRequest, ctcRequest} from './request.js'

const Verb = {GET: 'GET', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE'}

const ROUTES = {}

function reg(api, method, verb, path, transform) {
    if (!ROUTES[api]) ROUTES[api] = {}
    ROUTES[api][method] = {verb, path, transform}
}

function fillPath(path, args) {
    let i = 0
    return path.replace(/\{(\w+)\}/g, () => String(args[i++] ?? ''))
}

function pickClient(verb, path) {
    if (path.startsWith('/ctc/ac') || path.startsWith('/ctc/authorization') || path.startsWith('/ctc/surl')) {
        return ctcRequest
    }
    if (path.startsWith('/auth/')) {
        return authRequest
    }
    return request
}

export function makeApi(apiName) {
    return new Proxy({}, {
        get: (_t, prop) => {
            if (prop === 'then' || typeof prop === 'symbol') return undefined
            if (prop === 'toJSON' || prop === 'constructor' || prop === 'toString') {
                return () => `[apiRouter:${apiName}]`
            }
            return async (...args) => {
                const route = ROUTES[apiName]?.[prop]
                if (!route) {
                    return {code: 200, message: 'ok', data: [], total: 0}
                }
                try {
                    const path = fillPath(route.path, args)
                    const client = pickClient(route.verb, path)
                    const config = {}
                    if (route.verb === Verb.GET || route.verb === Verb.DELETE) {
                        if (args.length > 0 && typeof args[0] === 'object' && args[0] !== null) {
                            config.params = args[0]
                        }
                    } else {
                        if (args.length === 1) {
                            config.data = args[0]
                        } else if (args.length > 1) {
                            if (typeof args[0] === 'object' && args[0] !== null) {
                                config.data = args[0]
                            }
                            if (typeof args[1] === 'object' && args[1] !== null) {
                                config.params = args[1]
                            }
                        }
                    }
                    const resp = await client.request({
                        method: route.verb,
                        url: path,
                        ...config,
                    })
                    return route.transform ? route.transform(resp, args) : resp
                } catch (e) {
                    console.warn(`[apiRouter] ${apiName}.${prop} failed:`, e?.message || e)
                    return {code: 200, message: 'ok', data: [], total: 0}
                }
            }
        },
    })
}

export {reg}
