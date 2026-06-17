import React from 'react'
import {Tag, Tooltip} from 'antd'

/**
 * Cron 表达式展示 + 简单的人类可读转换
 * <p>
 * 抽自 z-schedule/_frontend/src/pages/JobList/index.tsx
 *
 * @example
 *   <CronDisplay cron="0 0 2 * * ?"/>  // "每天凌晨2点"
 */
function describeCron(expr: string): string {
    const parts = expr.split(/\s+/)
    if (parts.length < 6 || parts.length > 7) return expr

    const [sec, min, hour, day, month, week] = parts

    // 简单规则匹配（够 80% 场景）
    if (sec === '0' && min === '0' && hour !== '*' && day === '*' && month === '*' && week === '?') {
        return `每天 ${hour}点整`
    }
    if (sec === '0' && min === '0' && hour === '*' && day === '*' && month === '*' && week === '?') {
        return '每小时整点'
    }
    if (sec === '0' && min === '0' && hour === '*' && day === '*' && month === '*' && week !== '?') {
        return `每周${week}的每小时整点`
    }
    return expr
}

export interface CronDisplayProps {
    cron: string
    showDescription?: boolean
}

export default function CronDisplay({cron, showDescription = true}: CronDisplayProps) {
    if (!showDescription) return <Tag color="blue">{cron}</Tag>

    return (
        <Tooltip title={`原始: ${cron}`}>
            <Tag color="blue">{describeCron(cron)}</Tag>
        </Tooltip>
    )
}
