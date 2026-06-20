import {useEffect, useState} from 'react'
import {Card, Col, DatePicker, Empty, message, Row, Select, Space, Statistic, Table, Tag} from 'antd'
import {ApiOutlined, ReloadOutlined} from '@ant-design/icons'
import request from '../utils/request'

const RUN_STATUS_TAG = {
    PENDING: 'default',
    RUNNING: 'processing',
    SUCCESS: 'green',
    EMPTY: 'default',
    FAILED: 'red',
    FATAL: 'red',
}

function RunHistory() {
    const [subs, setSubs] = useState([])
    const [subscriptionId, setSubscriptionId] = useState(null)
    const [runs, setRuns] = useState([])
    const [items, setItems] = useState([])
    const [activeRunId, setActiveRunId] = useState(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        loadSubs()
    }, [])

    useEffect(() => {
        if (subscriptionId) loadRuns(subscriptionId)
    }, [subscriptionId])

    const loadSubs = async () => {
        try {
            const res = await request.get('/subscribe/subscription/list')
            const data = res?.data ?? res ?? []
            setSubs(Array.isArray(data) ? data : [])
            if (Array.isArray(data) && data.length > 0) {
                setSubscriptionId(data[0].id)
            }
        } catch (e) {
            message.error('加载订阅列表失败')
        }
    }

    const loadRuns = async (sid) => {
        setLoading(true)
        try {
            const res = await request.get(`/subscribe/run/list?subscriptionId=${sid}&limit=50`)
            const data = res?.data ?? res ?? []
            setRuns(Array.isArray(data) ? data : [])
        } catch (e) {
            message.error('加载运行历史失败')
        } finally {
            setLoading(false)
        }
    }

    const loadItems = async (runId) => {
        setActiveRunId(runId)
        try {
            const res = await request.get(`/subscribe/run/${runId}/items?limit=200`)
            const data = res?.data ?? res ?? []
            setItems(Array.isArray(data) ? data : [])
        } catch (e) {
            message.error('加载抽取项失败')
        }
    }

    // 累计
    const totalSuccess = runs.reduce((s, r) => s + (r.successCount || 0), 0)
    const totalFailed = runs.reduce((s, r) => s + (r.deadLetterCount || 0), 0)
    const totalDup = runs.reduce((s, r) => s + (r.duplicateCount || 0), 0)

    return (
        <div style={{padding: 24}}>
            <Card
                title={<Space><ApiOutlined/>订阅中心 - 运行历史</Space>}
                extra={
                    <Space>
                        <Select
                            style={{width: 280}}
                            placeholder="选择订阅"
                            value={subscriptionId}
                            onChange={setSubscriptionId}
                            options={subs.map(s => ({value: s.id, label: s.name}))}
                            showSearch
                            optionFilterProp="label"
                        />
                        <a onClick={() => subscriptionId && loadRuns(subscriptionId)}>
                            <ReloadOutlined/> 刷新
                        </a>
                    </Space>
                }
            >
                <Row gutter={16} style={{marginBottom: 16}}>
                    <Col span={6}><Card><Statistic title="run 总数" value={runs.length}/></Card></Col>
                    <Col span={6}><Card><Statistic title="成功条数" value={totalSuccess} valueStyle={{color: '#3f8600'}}/></Card></Col>
                    <Col span={6}><Card><Statistic title="死信条数" value={totalFailed} valueStyle={{color: '#cf1322'}}/></Card></Col>
                    <Col span={6}><Card><Statistic title="重复跳过" value={totalDup}/></Card></Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Card type="inner" title={`运行列表 (${runs.length})`} size="small">
                            <Table
                                rowKey="id"
                                size="small"
                                loading={loading}
                                dataSource={runs}
                                pagination={{pageSize: 10}}
                                onRow={(r) => ({onClick: () => loadItems(r.id),
                                    style: {cursor: 'pointer', background: r.id === activeRunId ? '#e6f7ff' : ''}})}
                                columns={[
                                    {title: 'ID', dataIndex: 'id', width: 60},
                                    {title: '计划', dataIndex: 'scheduledAt', width: 150,
                                        render: t => t ? new Date(t).toLocaleString() : '-'},
                                    {title: '耗时', dataIndex: 'durationMs', width: 80},
                                    {title: '状态', dataIndex: 'status', width: 80,
                                        render: s => <Tag color={RUN_STATUS_TAG[s]}>{s}</Tag>},
                                    {title: '拉取/成功/死信', width: 150,
                                        render: (_, r) => `${r.fetchedCount} / ${r.successCount} / ${r.deadLetterCount}`},
                                ]}
                            />
                        </Card>
                    </Col>
                    <Col span={12}>
                        <Card type="inner" title={activeRunId ? `run#${activeRunId} 抽取项 (${items.length})` : '抽取项'}
                              size="small">
                            {items.length === 0 ? (
                                <Empty description={activeRunId ? '该 run 无抽取项' : '点击左侧 run 查看抽取项'}/>
                            ) : (
                                <Table
                                    rowKey="id"
                                    size="small"
                                    dataSource={items}
                                    pagination={{pageSize: 10}}
                                    columns={[
                                        {title: 'id', dataIndex: 'dedupKey', width: 160, ellipsis: true},
                                        {title: 'title', dataIndex: 'normalized',
                                            render: (n) => {
                                                try { return JSON.parse(n).title || '(无标题)' }
                                                catch { return n }
                                            }},
                                        {title: 'link', dataIndex: 'normalized', width: 60,
                                            render: (n) => {
                                                try { const o = JSON.parse(n); return o.link ? <a href={o.link} target="_blank">↗</a> : '-' }
                                                catch { return '-' }
                                            }},
                                        {title: '状态', dataIndex: 'status', width: 100,
                                            render: s => <Tag>{s}</Tag>},
                                    ]}
                                />
                            )}
                        </Card>
                    </Col>
                </Row>
            </Card>
        </div>
    )
}

export default RunHistory
