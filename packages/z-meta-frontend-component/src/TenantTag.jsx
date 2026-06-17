import React from 'react'
import {Tag} from 'antd'

const colorMap = {
    active: 'green', 1: 'green', true: 'green',
    suspended: 'orange', 0: 'orange', false: 'orange',
    deleted: 'red',
}
const textMap = {
    active: '启用', 1: '启用', true: '启用',
    suspended: '停用', 0: '停用', false: '停用',
    deleted: '已删除',
}

export default function TenantTag({status, tenantCode}) {
    const key = String(status)
    const color = colorMap[key] || 'default'
    const text = textMap[key] || status
    return (
        <Tag color={color}>
            {tenantCode ? `${tenantCode} · ${text}` : text}
        </Tag>
    )
}
