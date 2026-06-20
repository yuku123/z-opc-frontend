import {useEffect, useState} from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {Alert, Button, Card, Form, Input, message, Radio, Select, Space, Spin, Table, Tag} from 'antd'
import {ArrowLeftOutlined, ApiOutlined, SaveOutlined} from '@ant-design/icons'
import request from '../utils/request'

const AGENT_ROLES = [
    {value: 'general', label: '通用助手'},
    {value: 'analyst', label: '分析师'},
    {value: 'writer', label: '写手'},
    {value: 'pm', label: '产品经理'},
    {value: 'ops', label: '运营'},
]

function ProjectCreate() {
    const navigate = useNavigate()
    const [search] = useSearchParams()
    const [form] = Form.useForm()
    const [saving, setSaving] = useState(false)
    const [mode, setMode] = useState('from-subscribe')   // from-subscribe / manual
    const [subs, setSubs] = useState([])
    const [items, setItems] = useState([])
    const [itemsLoading, setItemsLoading] = useState(false)
    const [selectedIds, setSelectedIds] = useState([])
    const [selectedSubId, setSelectedSubId] = useState(null)

    // 从 URL 预填 (从订阅页跳过来)
    useEffect(() => {
        const sid = search.get('subscriptionId')
        const ids = search.get('itemIds')
        if (sid) {
            setSelectedSubId(Number(sid))
            form.setFieldValue('sourceSubscriptionId', Number(sid))
            loadItems(sid)
        }
        if (ids) {
            setSelectedIds(ids.split(',').map(Number).filter(Boolean))
        }
    }, [search])

    useEffect(() => {
        loadSubs()
    }, [])

    const loadSubs = async () => {
        try {
            const res = await request.get('/subscribe/subscription/list')
            const list = res?.data ?? res ?? []
            setSubs(Array.isArray(list) ? list.filter(s => s.status === 'VERIFIED') : [])
        } catch (e) {}
    }

    const loadItems = async (subId) => {
        setItemsLoading(true)
        try {
            const res = await request.get(`/subscribe/run/list?subscriptionId=${subId}&limit=1`)
            const runs = res?.data ?? res ?? []
            if (runs.length === 0) {
                setItems([])
                return
            }
            // 取最近一个 SUCCESS run 的 items
            const run = runs[0]
            const itemsRes = await request.get(`/subscribe/run/${run.id}/items?limit=100`)
            const list = itemsRes?.data ?? itemsRes ?? []
            setItems(Array.isArray(list) ? list : [])
        } catch (e) {
            message.error('加载抽取项失败')
        } finally {
            setItemsLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            if (mode === 'from-subscribe' && selectedIds.length === 0) {
                message.warning('请至少选 1 个 item')
                return
            }
            setSaving(true)
            const payload = {
                ...values,
                sourceItemIds: mode === 'from-subscribe' ? selectedIds.map(String) : null,
            }
            const url = mode === 'from-subscribe'
                ? '/project/create-from-items'
                : '/project/create-manual'
            const res = await request.post(url, payload)
            if (res && res.success !== false) {
                const data = res.data ?? res
                message.success('立项成功')
                navigate(`/project/${data.id}`)
            } else {
                message.error(res?.message || '立项失败')
            }
        } catch (e) {
            if (!e?.errorFields) message.error('立项失败: ' + (e?.message || ''))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div style={{padding: 24}}>
            <Card
                title={
                    <Space>
                        <Button type="text" icon={<ArrowLeftOutlined/>} onClick={() => navigate('/project/list')}/>
                        <ApiOutlined/>新建项目 (立项)
                    </Space>
                }
                extra={
                    <Space>
                        <Button onClick={() => navigate('/project/list')}>取消</Button>
                        <Button type="primary" icon={<SaveOutlined/>} loading={saving} onClick={handleSave}>立项</Button>
                    </Space>
                }
            >
                <Form form={form} layout="vertical" initialValues={{agentRole: 'general'}}>
                    <Form.Item label="来源">
                        <Radio.Group value={mode} onChange={e => setMode(e.target.value)}>
                            <Radio.Button value="from-subscribe">从订阅线索立项 (主路径)</Radio.Button>
                            <Radio.Button value="manual">手动立项 (无源数据)</Radio.Button>
                        </Radio.Group>
                    </Form.Item>

                    <Form.Item label="项目名称" name="name" rules={[{required: true, message: '请输入名称'}]}>
                        <Input placeholder="例如: 跟进 GitHub 高优 Issue"/>
                    </Form.Item>
                    <Form.Item label="项目描述" name="description">
                        <Input.TextArea rows={2} placeholder="(可选) 这个项目要解决什么?"/>
                    </Form.Item>

                    {mode === 'from-subscribe' && (
                        <Card type="inner" title="源数据" style={{marginBottom: 16}}>
                            <Form.Item label="选择订阅" name="sourceSubscriptionId"
                                       rules={[{required: true, message: '请选订阅'}]}>
                                <Select
                                    placeholder="选择订阅 (拉取最近一次 run 的 items)"
                                    options={subs.map(s => ({value: s.id, label: `#${s.id} ${s.name}`}))}
                                    onChange={(v) => { setSelectedSubId(v); loadItems(v); setSelectedIds([]) }}
                                />
                            </Form.Item>
                            {selectedSubId && (
                                <Spin spinning={itemsLoading}>
                                    <div style={{marginBottom: 8}}>
                                        <Tag color="blue">已选 {selectedIds.length} / {items.length}</Tag>
                                        <Button size="small" onClick={() => setSelectedIds(items.map(i => i.id))}>全选</Button>
                                        <Button size="small" onClick={() => setSelectedIds([])} style={{marginLeft: 4}}>清空</Button>
                                    </div>
                                    <Table
                                        rowKey="id"
                                        size="small"
                                        dataSource={items}
                                        pagination={{pageSize: 10}}
                                        rowSelection={{
                                            selectedRowKeys: selectedIds,
                                            onChange: setSelectedIds,
                                        }}
                                        columns={[
                                            {title: 'id', dataIndex: 'dedupKey', width: 160, ellipsis: true},
                                            {title: 'title', dataIndex: 'normalized',
                                                render: (n) => {
                                                    try { return JSON.parse(n).title || '(无)' }
                                                    catch { return n }
                                                }},
                                            {title: 'fetched', dataIndex: 'fetchedAt', width: 150,
                                                render: t => t ? new Date(t).toLocaleString() : '-'},
                                        ]}
                                    />
                                </Spin>
                            )}
                        </Card>
                    )}

                    <Card type="inner" title="Agent 配置" style={{marginBottom: 16}}>
                        <Form.Item label="Agent 角色" name="agentRole" extra="决定 system prompt 的语气 / 视角">
                            <Select options={AGENT_ROLES}/>
                        </Form.Item>
                        <Form.Item label="模型 (可选)" name="modelCode"
                                   extra="留空走默认 (智能中心 LLM 凭证里第一个 enabled)">
                            <Input placeholder="例如: gpt-4 / deepseek-chat"/>
                        </Form.Item>
                    </Card>

                    <Alert
                        type="info" showIcon
                        message="立项后源数据会被快照 (context_snapshot), 后续订阅更新不会影响项目上下文."
                    />
                </Form>
            </Card>
        </div>
    )
}

export default ProjectCreate
