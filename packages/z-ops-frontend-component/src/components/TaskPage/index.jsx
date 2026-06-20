/**
 * 部署记录 (DeploymentRecord list, filtered by unit)
 */
import {useEffect, useState} from 'react'
import {message, Select, Space, Table, Tag} from 'antd'
import {deploymentUnitApi, recordApi} from '../../api'

const TaskPage = () => {
    const [data, setData] = useState([])
    const [units, setUnits] = useState([])
    const [selectedUnit, setSelectedUnit] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => { (async () => { try { const list = await deploymentUnitApi.list() || []; setUnits(list); if (list.length) setSelectedUnit(list[0].id) } catch { message.error('加载部署单元失败') } })() }, [])
    useEffect(() => { if (!selectedUnit) { setData([]); return }; (async () => { setLoading(true); try { setData(await recordApi.list(selectedUnit) || []) } catch { message.error('加载记录失败') } finally { setLoading(false) } })() }, [selectedUnit])

    const statusMap = {SUCCESS: {text: '成功', color: 'green'}, FAILED: {text: '失败', color: 'red'}, RUNNING: {text: '运行中', color: 'processing'}, PENDING: {text: '等待中', color: 'default'}}
    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '分支', dataIndex: 'branch', width: 120},
        {title: 'Commit', dataIndex: 'commitId', width: 100, ellipsis: true, render: v => v ? <code>{v.substring(0, 8)}</code> : '-'},
        {title: '部署人', dataIndex: 'deployer', width: 100},
        {title: '触发方式', dataIndex: 'triggerType', width: 100, render: v => ({MANUAL: '手动', WEBHOOK: 'Webhook', SCHEDULE: '定时'}[v] || v || '-')},
        {title: '开始时间', dataIndex: 'startedAt', width: 170},
        {title: '结束时间', dataIndex: 'finishedAt', width: 170},
        {title: '状态', dataIndex: 'status', width: 90, render: v => { const s = statusMap[v] || {text: v, color: 'default'}; return <Tag color={s.color}>{s.text}</Tag> }},
        {title: '结果', dataIndex: 'result', ellipsis: true}
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}>部署记录</h2><span style={{color: '#8a8f98', fontSize: 14}}>查看历史部署记录</span></div>
                <Space><span style={{color: '#8a8f98'}}>部署单元:</span><Select value={selectedUnit} onChange={setSelectedUnit} style={{width: 240}}>{units.map(u => <Select.Option key={u.id} value={u.id}>{u.name}</Select.Option>)}</Select></Space>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{pageSize: 10}} locale={{emptyText: '暂无部署记录'}}/>
            </div>
        </div>
    )
}
export default TaskPage
