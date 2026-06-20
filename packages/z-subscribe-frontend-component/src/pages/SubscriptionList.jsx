import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {
    Alert,
    Button,
    Card,
    Drawer,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Table,
    Tabs,
    Tag,
    Timeline,
    Tooltip
} from 'antd'
import {
    ApiOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    ExclamationCircleOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    ProjectOutlined,
    ReloadOutlined,
    ThunderboltOutlined
} from '@ant-design/icons'
import request from '../utils/request'

// 抽取器类型 -> 中文 + 颜色
const EXTRACTOR_LABEL = {
    STANDARD_JSON: {label: '标准 JSON', color: 'blue'},
    RSS_XML: {label: 'RSS 2.0', color: 'orange'},
    ATOM_XML: {label: 'Atom 1.0', color: 'gold'},
    CUSTOM_SCRIPT: {label: '自定义脚本', color: 'purple'},
    INTERNAL_BEAN: {label: '内部 Bean', color: 'cyan'},
}

// 状态 -> 颜色
const STATUS_TAG = {
    PENDING_VERIFY: {color: 'default', text: '待验证'},
    VERIFIED: {color: 'green', text: '已验证'},
    INVALID_AUTH: {color: 'red', text: '鉴权失败'},
    FATAL: {color: 'red', text: '永久失败'},
    DISABLED: {color: 'default', text: '已停用'},
}

const RUN_STATUS_TAG = {
    PENDING: {color: 'default'},
    RUNNING: {color: 'processing'},
    SUCCESS: {color: 'green'},
    EMPTY: {color: 'default'},
    FAILED: {color: 'red'},
    FATAL: {color: 'red'},
}

function SubscriptionList() {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [detail, setDetail] = useState(null)          // dry-run 详情 Drawer
    const [runs, setRuns] = useState([])                // 选中订阅的 run 列表
    const [runItems, setRunItems] = useState({})        // runId -> items
    const [activeRunId, setActiveRunId] = useState(null)
    const [selectedItemIds, setSelectedItemIds] = useState([])

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await request.get('/subscribe/subscription/list')
            if (res && res.success !== false) {
                setData(Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []))
            }
        } catch (e) {
            message.error('获取订阅列表失败: ' + (e?.message || ''))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined/>,
            content: `确定要删除订阅 "${record.name}" 吗? 运行历史会保留.`,
            onOk: async () => {
                try {
                    const res = await request.delete(`/subscribe/subscription/${record.id}`)
                    if (res && res.success !== false) {
                        message.success('删除成功')
                        fetchData()
                    } else {
                        message.error(res?.message || '删除失败')
                    }
                } catch (e) {
                    message.error('删除失败: ' + (e?.message || ''))
                }
            },
        })
    }

    const handleEnable = async (id) => {
        try {
            const res = await request.post(`/subscribe/subscription/${id}/enable`)
            if (res && res.success !== false) {
                message.success('已启用')
                fetchData()
            } else {
                message.error(res?.message || '启用失败')
            }
        } catch (e) {
            message.error('启用失败: ' + (e?.message || ''))
        }
    }

    const handleDisable = async (id) => {
        try {
            const res = await request.post(`/subscribe/subscription/${id}/disable`)
            if (res && res.success !== false) {
                message.success('已停用')
                fetchData()
            } else {
                message.error(res?.message || '停用失败')
            }
        } catch (e) {
            message.error('停用失败: ' + (e?.message || ''))
        }
    }

    const handleTrigger = async (record) => {
        Modal.confirm({
            title: '手动触发',
            content: `将立即执行一次 "${record.name}" 的抽取, 同步返回 runId.`,
            onOk: async () => {
                try {
                    const res = await request.post(`/subscribe/subscription/${record.id}/trigger?triggerBy=ceo`)
                    if (res && (res.data !== undefined || res.success !== false)) {
                        const runId = res.data ?? res
                        message.success(`已触发, runId = ${runId}`)
                        openRuns(record)
                    } else {
                        message.error(res?.message || '触发失败')
                    }
                } catch (e) {
                    message.error('触发失败: ' + (e?.message || ''))
                }
            },
        })
    }

    const handleDryRun = async (record) => {
        try {
            const res = await request.post(`/subscribe/subscription/${record.id}/dry-run`)
            setDetail({sub: record, result: res?.data ?? res})
        } catch (e) {
            setDetail({sub: record, result: {success: false, errorMessage: e?.message || '请求失败'}})
        }
    }

    const openRuns = async (record) => {
        try {
            const res = await request.get(`/subscribe/run/list?subscriptionId=${record.id}&limit=20`)
            const list = res?.data ?? res ?? []
            setRuns(Array.isArray(list) ? list : [])
            setActiveRunId(null)
            setRunItems({})
            setSelectedItemIds([])
            setDetail({sub: record, tab: 'runs'})
        } catch (e) {
            message.error('获取运行历史失败')
        }
    }

    const loadRunItems = async (runId) => {
        if (runItems[runId]) {
            setActiveRunId(runId)
            return
        }
        try {
            const res = await request.get(`/subscribe/run/${runId}/items?limit=200`)
            const list = res?.data ?? res ?? []
            setRunItems(prev => ({...prev, [runId]: Array.isArray(list) ? list : []}))
            setActiveRunId(runId)
        } catch (e) {
            message.error('获取抽取项失败')
        }
    }

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 70,
        },
        {
            title: '名称',
            dataIndex: 'name',
            render: (name, r) => (
                <Space orientation="vertical" size={0}>
                    <span style={{fontWeight: 500}}>{name}</span>
                    {r.description && <span style={{color: '#999', fontSize: 12}}>{r.description}</span>}
                </Space>
            ),
        },
        {
            title: '数据源',
            dataIndex: 'sourceType',
            width: 90,
            render: (t) => <Tag>{t}</Tag>,
        },
        {
            title: '抽取器',
            dataIndex: 'extractorType',
            width: 140,
            render: (t) => {
                const meta = EXTRACTOR_LABEL[t] || {label: t, color: 'default'}
                return <Tag color={meta.color}>{meta.label}</Tag>
            },
        },
        {
            title: 'Cron',
            dataIndex: 'cronExpr',
            width: 150,
            render: (c) => <code style={{fontSize: 12}}>{c}</code>,
        },
        {
            title: '状态',
            dataIndex: 'status',
            width: 110,
            render: (s) => {
                const m = STATUS_TAG[s] || {color: 'default', text: s}
                return <Tag color={m.color}>{m.text}</Tag>
            },
        },
        {
            title: '启用',
            dataIndex: 'enabled',
            width: 80,
            render: (e, r) => e ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
        },
        {
            title: '最近 run',
            dataIndex: 'lastStatus',
            width: 110,
            render: (s, r) => s ? (
                <Tooltip title={r.lastError || ''}>
                    <Tag color={RUN_STATUS_TAG[s]?.color || 'default'}>{s}</Tag>
                </Tooltip>
            ) : <span style={{color: '#ccc'}}>-</span>,
        },
        {
            title: '累计',
            width: 130,
            render: (_, r) => (
                <Space size={4}>
                    <Tag color="green">✓ {r.successCountTotal || 0}</Tag>
                    <Tag color="red">✗ {r.failCountTotal || 0}</Tag>
                </Space>
            ),
        },
        {
            title: '操作',
            width: 280,
            fixed: 'right',
            render: (_, r) => (
                <Space size={4} wrap>
                    <Button type="link" size="small" icon={<EditOutlined/>}
                            onClick={() => navigate(`/subscribe/edit/${r.id}`)}>编辑</Button>
                    <Button type="link" size="small" icon={<ThunderboltOutlined/>}
                            onClick={() => handleDryRun(r)}>试运行</Button>
                    <Button type="link" size="small" icon={<PlayCircleOutlined/>}
                            onClick={() => handleTrigger(r)}>触发</Button>
                    <Button type="link" size="small"
                            onClick={() => openRuns(r)}>历史</Button>
                    {r.enabled ? (
                        <Button type="link" size="small" icon={<PauseCircleOutlined/>}
                                onClick={() => handleDisable(r.id)}>停用</Button>
                    ) : (
                        <Button type="link" size="small" icon={<CheckCircleOutlined/>}
                                onClick={() => handleEnable(r.id)}>启用</Button>
                    )}
                    <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r)} okText="删除" cancelText="取消">
                        <Button type="link" size="small" danger icon={<DeleteOutlined/>}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div style={{padding: 24}}>
            <Card
                title={<Space><ApiOutlined/>订阅中心 - 数据源订阅</Space>}
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined/>} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined/>}
                                onClick={() => navigate('/subscribe/new')}>新建订阅</Button>
                    </Space>
                }
            >
                <Alert
                    type="info"
                    showIcon
                    style={{marginBottom: 16}}
                    message="订阅中心负责把三方 / 内部 / RSS 等数据源按 Cron 定时抽取, 归一化后落到本地, 供 CEO 立项和 Agent 协作使用."
                />
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    scroll={{x: 1400}}
                    size="middle"
                    pagination={{pageSize: 20, showSizeChanger: true, showTotal: t => `共 ${t} 条`}}
                />
            </Card>

            {/* dry-run 详情 Drawer */}
            <Drawer
                title={detail?.sub ? `试运行 - ${detail.sub.name}` : '运行历史'}
                open={!!detail}
                onClose={() => setDetail(null)}
                width={900}
            >
                {detail?.tab === 'runs' ? (
                    <Tabs
                        activeKey={activeRunId ? 'items' : 'list'}
                        onChange={(k) => k === 'list' && setActiveRunId(null)}
                        items={[
                            {
                                key: 'list',
                                label: `运行列表 (${runs.length})`,
                                children: (
                                    <Table
                                        rowKey="id"
                                        size="small"
                                        dataSource={runs}
                                        pagination={false}
                                        onRow={(r) => ({onClick: () => loadRunItems(r.id)})}
                                        columns={[
                                            {title: 'runId', dataIndex: 'id', width: 70},
                                            {title: '计划', dataIndex: 'scheduledAt', width: 160,
                                                render: t => t ? new Date(t).toLocaleString() : '-'},
                                            {title: '耗时(ms)', dataIndex: 'durationMs', width: 90},
                                            {title: '状态', dataIndex: 'status', width: 90,
                                                render: s => <Tag color={RUN_STATUS_TAG[s]?.color}>{s}</Tag>},
                                            {title: '拉取/成功/重复/死信', width: 200,
                                                render: (_, r) => `${r.fetchedCount} / ${r.successCount} / ${r.duplicateCount || 0} / ${r.deadLetterCount}`},
                                            {title: '错误', dataIndex: 'errorMessage',
                                                render: e => e ? <span style={{color: '#cf1322', fontSize: 12}}>{e}</span> : '-'},
                                        ]}
                                    />
                                ),
                            },
                            {
                                key: 'items',
                                label: activeRunId ? `run#${activeRunId} 抽取项` : '抽取项',
                                disabled: !activeRunId,
                                children: (
                                    <Space orientation="vertical" style={{width: '100%'}}>
                                        <Space>
                                            <Tag color="blue">已选 {selectedItemIds.length} 条</Tag>
                                            <Button size="small" type="primary"
                                                    icon={<ProjectOutlined/>}
                                                    disabled={selectedItemIds.length === 0}
                                                    onClick={() => {
                                                        const ids = selectedItemIds.join(',')
                                                        navigate(`/project/new?subscriptionId=${detail.sub.id}&itemIds=${ids}`)
                                                    }}>
                                                用所选 {selectedItemIds.length} 条立项
                                            </Button>
                                        </Space>
                                        <Table
                                            rowKey="id"
                                            size="small"
                                            dataSource={runItems[activeRunId] || []}
                                            pagination={{pageSize: 20}}
                                            rowSelection={{
                                                selectedRowKeys: selectedItemIds,
                                                onChange: setSelectedItemIds,
                                            }}
                                            columns={[
                                                {title: 'id', dataIndex: 'dedupKey', width: 180, ellipsis: true},
                                                {title: 'title', dataIndex: 'normalized',
                                                    render: (n) => {
                                                        try { const o = JSON.parse(n); return o.title || '(无标题)' }
                                                        catch { return n }
                                                    }},
                                                {title: 'link', dataIndex: 'normalized',
                                                    render: (n) => {
                                                        try { const o = JSON.parse(n); return o.link ? <a href={o.link} target="_blank">↗</a> : '-' }
                                                        catch { return '-' }
                                                    }},
                                                {title: '状态', dataIndex: 'status', width: 110,
                                                    render: s => <Tag>{s}</Tag>},
                                            ]}
                                        />
                                    </Space>
                                ),
                            },
                        ]}
                    />
                ) : (
                    <DryRunResultView result={detail?.result}/>
                )}
            </Drawer>
        </div>
    )
}

function DryRunResultView({result}) {
    if (!result) return null
    if (!result.success) {
        return <Alert type="error" showIcon message="试运行失败" description={result.errorMessage || '未知错误'}/>
    }
    return (
        <Space orientation="vertical" style={{width: '100%'}} size="middle">
            <Card size="small" title="调用结果">
                <Space size="large" wrap>
                    <span><b>HTTP:</b> {result.httpStatus || '-'}</span>
                    <span><b>耗时:</b> {result.latencyMs}ms</span>
                    <span><b>大小:</b> {result.responseSize}B</span>
                    <span><b>样本:</b> {result.sampleCount} 条</span>
                </Space>
            </Card>
            {result.firstItem && (
                <Card size="small" title="第一条样本 (归一化后)">
                    <pre style={{background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto'}}>
                        {JSON.stringify(result.firstItem, null, 2)}
                    </pre>
                </Card>
            )}
            {result.responsePreview && (
                <Card size="small" title="响应预览 (前 4KB)">
                    <pre style={{background: '#f5f5f5', padding: 12, borderRadius: 4, maxHeight: 300, overflow: 'auto', fontSize: 12}}>
                        {result.responsePreview}
                    </pre>
                </Card>
            )}
            {result.fieldErrors && result.fieldErrors.length > 0 && (
                <Alert type="warning" showIcon message="字段问题" description={
                    <ul>{result.fieldErrors.map((e, i) => <li key={i}>{e}</li>)}</ul>
                }/>
            )}
        </Space>
    )
}

export default SubscriptionList
