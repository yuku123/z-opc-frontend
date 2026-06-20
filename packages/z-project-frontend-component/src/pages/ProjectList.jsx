import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button, Card, message, Popconfirm, Space, Table, Tabs, Tag} from 'antd'
import {ApiOutlined, CheckCircleOutlined, PlusOutlined, ReloadOutlined} from '@ant-design/icons'
import request from '../utils/request'

const STATUS_TAG = {
    OPEN: {color: 'blue', text: '待开始'},
    IN_PROGRESS: {color: 'green', text: '进行中'},
    COMPLETED: {color: 'default', text: '已完成'},
    ARCHIVED: {color: 'default', text: '已归档'},
}

function ProjectList() {
    const navigate = useNavigate()
    const [tab, setTab] = useState('mine')
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const url = tab === 'mine'
                ? '/project/list/mine?limit=100'
                : `/project/list/by-status?status=${tab}&limit=100`
            const res = await request.get(url)
            const list = res?.data ?? res ?? []
            setData(Array.isArray(list) ? list : [])
        } catch (e) {
            message.error('加载项目失败: ' + (e?.message || ''))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [tab])

    const handleComplete = async (id) => {
        try {
            const res = await request.post(`/project/${id}/status?status=COMPLETED`)
            if (res && res.success !== false) {
                message.success('已标记完成')
                fetchData()
            }
        } catch (e) {
            message.error('操作失败: ' + (e?.message || ''))
        }
    }

    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '名称', dataIndex: 'name', render: (n, r) => (
            <Space orientation="vertical" size={0}>
                <a onClick={() => navigate(`/project/${r.id}`)} style={{fontWeight: 500}}>{n}</a>
                {r.description && <span style={{color: '#999', fontSize: 12}}>{r.description}</span>}
            </Space>
        )},
        {title: '来源', dataIndex: 'sourceType', width: 100, render: (t) => <Tag>{t}</Tag>},
        {title: '订阅', dataIndex: 'sourceSubscriptionId', width: 80,
            render: (v) => v ? `#${v}` : <span style={{color: '#ccc'}}>-</span>},
        {title: '状态', dataIndex: 'status', width: 100, render: (s) => {
            const m = STATUS_TAG[s] || {color: 'default', text: s}
            return <Tag color={m.color}>{m.text}</Tag>
        }},
        {title: '消息数', dataIndex: 'messageCount', width: 80},
        {title: '上下文', width: 130, render: (_, r) => (
            <Space size={4}>
                <Tag color="blue">{r.contextSize || 0}B</Tag>
            </Space>
        )},
        {title: '最近活动', dataIndex: 'lastMessageAt', width: 150,
            render: t => t ? new Date(t).toLocaleString() : <span style={{color: '#ccc'}}>-</span>},
        {title: '操作', width: 160, render: (_, r) => (
            <Space size={4}>
                <Button type="link" size="small" onClick={() => navigate(`/project/${r.id}`)}>对话</Button>
                {r.status !== 'COMPLETED' && r.status !== 'ARCHIVED' && (
                    <Popconfirm title="标记为已完成?" onConfirm={() => handleComplete(r.id)}>
                        <Button type="link" size="small" icon={<CheckCircleOutlined/>}>完成</Button>
                    </Popconfirm>
                )}
            </Space>
        )},
    ]

    return (
        <div style={{padding: 24}}>
            <Card
                title={<Space><ApiOutlined/>项目中心 (CEO 立项 + Agent 对话)</Space>}
                extra={
                    <Space>
                        <Button icon={<ReloadOutlined/>} onClick={fetchData}>刷新</Button>
                        <Button type="primary" icon={<PlusOutlined/>}
                                onClick={() => navigate('/project/new')}>新建项目</Button>
                    </Space>
                }
            >
                <Tabs
                    activeKey={tab}
                    onChange={setTab}
                    items={[
                        {key: 'mine', label: '我的进行中'},
                        {key: 'OPEN', label: '待开始'},
                        {key: 'IN_PROGRESS', label: '进行中'},
                        {key: 'COMPLETED', label: '已完成'},
                    ]}
                />
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={data}
                    loading={loading}
                    size="middle"
                    pagination={{pageSize: 20}}
                />
            </Card>
        </div>
    )
}

export default ProjectList
