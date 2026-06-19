import {useEffect, useState} from 'react'
import {
    Button,
    Card,
    Descriptions,
    Form,
    Input,
    InputNumber,
    message,
    Modal,
    Popconfirm,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography
} from 'antd'
import {
    ApiOutlined,
    DeleteOutlined,
    LinkOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    ReloadOutlined
} from '@ant-design/icons'
import {mcpApi} from '../../api'

const {TextArea} = Input
const {Text} = Typography

export default function McpPage() {
    const [activeTab, setActiveTab] = useState('servers')
    const [servers, setServers] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form] = Form.useForm()

    // Tool test state
    const [selectedServer, setSelectedServer] = useState(null)
    const [tools, setTools] = useState([])
    const [selectedTool, setSelectedTool] = useState(null)
    const [toolArgs, setToolArgs] = useState('{}')
    const [toolResult, setToolResult] = useState('')
    const [toolRunning, setToolRunning] = useState(false)
    const [testResult, setTestResult] = useState(null)

    useEffect(() => {
        loadServers()
    }, [])

    const loadServers = async () => {
        setLoading(true)
        try {
            const tenant = localStorage.getItem('z_tenant') || 'default'
            const res = await mcpApi.list(tenant)
            // 兼容：API 可能返回 404 或空数据
            setServers(Array.isArray(res) ? res : (res?.data || res || []))
        } catch (e) {
            // API 不存在时显示空状态，不报错
            console.warn('MCP API 不可用:', e?.message)
            setServers([])
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            const data = {...values}
            if (editing) {
                data.id = editing.id
                await mcpApi.update(data)
                message.success('更新成功')
            } else {
                await mcpApi.create(data)
                message.success('创建成功')
            }
            setModalOpen(false)
            setEditing(null)
            form.resetFields()
            loadServers()
        } catch (e) { /* validation error */
        }
    }

    const handleEdit = (record) => {
        setEditing(record)
        form.setFieldsValue(record)
        setModalOpen(true)
    }

    const handleDelete = async (id) => {
        await mcpApi.delete(id)
        message.success('已删除')
        loadServers()
    }

    const handleTest = async (record) => {
        setTestResult({loading: true})
        try {
            const res = await mcpApi.test(record.id)
            setTestResult(res?.data || res)
        } catch (e) {
            setTestResult({connected: false, error: e.message})
        }
    }

    const handleSelectServer = async (record) => {
        setSelectedServer(record)
        setSelectedTool(null)
        setToolResult('')
        try {
            const res = await mcpApi.listTools(record.id)
            const data = res?.data || res
            setTools(data?.tools || [])
        } catch (e) {
            setTools([])
            message.error('获取工具列表失败')
        }
    }

    const handleSelectTool = (tool) => {
        setSelectedTool(tool)
        // Build default args from schema
        const schema = tool.inputSchema
        if (schema?.properties) {
            const defaults = {}
            Object.keys(schema.properties).forEach(k => {
                defaults[k] = ''
            })
            setToolArgs(JSON.stringify(defaults, null, 2))
        } else {
            setToolArgs('{}')
        }
        setToolResult('')
    }

    const handleRunTool = async () => {
        if (!selectedServer || !selectedTool) return
        setToolRunning(true)
        setToolResult('Running...')
        try {
            let args = {}
            try {
                args = JSON.parse(toolArgs)
            } catch (e) {
            }
            const res = await mcpApi.callTool(selectedServer.id, selectedTool.name, args)
            const data = res?.data || res
            if (data?.content && data.content.length > 0) {
                setToolResult(data.content[0].text || JSON.stringify(data.content, null, 2))
            } else {
                setToolResult(JSON.stringify(data, null, 2))
            }
        } catch (e) {
            setToolResult('Error: ' + e.message)
        } finally {
            setToolRunning(false)
        }
    }

    // ===== Server columns =====
    const columns = [
        {title: '名称', dataIndex: 'serverName', key: 'serverName', width: 140},
        {
            title: '类型', dataIndex: 'transportType', key: 'transportType', width: 80,
            render: (v) => <Tag color={v === 'STDIO' ? 'purple' : 'blue'}>{v || 'HTTP'}</Tag>
        },
        {title: 'URL', dataIndex: 'url', key: 'url', ellipsis: true},
        {
            title: '状态', dataIndex: 'status', key: 'status', width: 80,
            render: (v) => <Tag color={v === 'active' ? 'green' : 'default'}>{v || 'active'}</Tag>
        },
        {
            title: '操作', key: 'actions', width: 260, render: (_, r) => (
                <Space size="small">
                    <Button size="small" icon={<ApiOutlined/>} onClick={() => handleSelectServer(r)}>工具</Button>
                    <Button size="small" icon={<LinkOutlined/>} onClick={() => handleTest(r)}>测试</Button>
                    <Button size="small" onClick={() => handleEdit(r)}>编辑</Button>
                    <Popconfirm title="确认删除?" onConfirm={() => handleDelete(r.id)}>
                        <Button size="small" danger icon={<DeleteOutlined/>}/>
                    </Popconfirm>
                </Space>
            )
        },
    ]

    return (
        <div style={{height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column'}}>
            <Tabs activeKey={activeTab} onChange={setActiveTab} tabBarExtraContent={
                <Button type="primary" icon={<PlusOutlined/>} onClick={() => {
                    setEditing(null);
                    form.resetFields();
                    setModalOpen(true)
                }}>
                    添加服务
                </Button>
            }>
                <Tabs.TabPane tab="服务管理" key="servers"/>
                <Tabs.TabPane tab="工具测试" key="test" disabled={!selectedServer}/>
            </Tabs>

            {activeTab === 'servers' && (
                <div style={{flex: 1, display: 'flex', gap: 16, overflow: 'hidden'}}>
                    {/* Server List */}
                    <div style={{flex: selectedServer ? '0 0 50%' : 1, overflow: 'auto'}}>
                        <Table columns={columns} dataSource={servers} rowKey="id" loading={loading}
                               size="small" pagination={false}
                               onRow={(r) => ({
                                   onClick: () => handleSelectServer(r),
                                   style: {
                                       background: selectedServer?.id === r.id ? '#e6f7ff' : undefined,
                                       cursor: 'pointer'
                                   }
                               })}/>
                    </div>

                    {/* Tool Explorer */}
                    {selectedServer && (
                        <div style={{
                            flex: '0 0 50%',
                            borderLeft: '1px solid #f0f0f0',
                            paddingLeft: 16,
                            overflow: 'auto'
                        }}>
                            <div style={{
                                marginBottom: 12,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <Text strong style={{fontSize: 15}}>{selectedServer.serverName} — 工具列表</Text>
                                <Button size="small" icon={<ReloadOutlined/>}
                                        onClick={() => handleSelectServer(selectedServer)}>刷新</Button>
                            </div>
                            {tools.length === 0 ? (
                                <div style={{textAlign: 'center', padding: 40, color: '#999'}}>暂无工具</div>
                            ) : (
                                tools.map(t => (
                                    <Card key={t.name} size="small" hoverable
                                          style={{
                                              marginBottom: 8,
                                              borderColor: selectedTool?.name === t.name ? '#1890ff' : undefined
                                          }}
                                          onClick={() => {
                                              handleSelectTool(t);
                                              setActiveTab('test')
                                          }}>
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center'
                                        }}>
                                            <div>
                                                <Text strong>{t.name}</Text>
                                                <br/><Text type="secondary"
                                                           style={{fontSize: 12}}>{t.description}</Text>
                                            </div>
                                            <Tag color="blue" style={{cursor: 'pointer'}}
                                                 onClick={(e) => {
                                                     e.stopPropagation();
                                                     handleSelectTool(t);
                                                     setActiveTab('test')
                                                 }}>
                                                测试 →
                                            </Tag>
                                        </div>
                                    </Card>
                                ))
                            )}
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'test' && selectedTool && (
                <div style={{flex: 1, display: 'flex', gap: 16, overflow: 'hidden'}}>
                    {/* Input */}
                    <div style={{flex: '0 0 40%', display: 'flex', flexDirection: 'column'}}>
                        <div style={{marginBottom: 8}}>
                            <Text strong>{selectedTool.name}</Text>
                            <Text type="secondary" style={{marginLeft: 8}}>{selectedTool.description}</Text>
                        </div>
                        <Text type="secondary" style={{marginBottom: 4}}>参数 (JSON):</Text>
                        <TextArea rows={8} value={toolArgs} onChange={e => setToolArgs(e.target.value)}
                                  style={{fontFamily: 'monospace', fontSize: 13}}/>
                        <Button type="primary" icon={<PlayCircleOutlined/>} onClick={handleRunTool}
                                loading={toolRunning} style={{marginTop: 12}}>执行</Button>
                    </div>
                    {/* Output */}
                    <div style={{flex: '0 0 60%', display: 'flex', flexDirection: 'column'}}>
                        <Text type="secondary" style={{marginBottom: 4}}>结果:</Text>
                        <pre style={{
                            flex: 1, overflow: 'auto', background: '#f5f5f5', padding: 12, borderRadius: 4,
                            fontFamily: 'monospace', fontSize: 13, margin: 0, whiteSpace: 'pre-wrap'
                        }}>
              {toolResult || '点击"执行"查看结果'}
            </pre>
                    </div>
                </div>
            )}

            {/* Test Result Modal */}
            <Modal title={`测试连接 - ${testResult ? '' : ''}`} open={!!testResult} onCancel={() => setTestResult(null)}
                   footer={<Button onClick={() => setTestResult(null)}>关闭</Button>}>
                {testResult?.loading ? <Text>测试中...</Text> : testResult ? (
                    <Descriptions column={1} size="small">
                        <Descriptions.Item label="连接状态">
                            <Tag
                                color={testResult.connected ? 'green' : 'red'}>{testResult.connected ? '成功' : '失败'}</Tag>
                        </Descriptions.Item>
                        {testResult.serverInfo && <Descriptions.Item label="服务信息">
                            {testResult.serverInfo?.name} v{testResult.serverInfo?.version}
                        </Descriptions.Item>}
                        {testResult.toolCount !== undefined &&
                            <Descriptions.Item label="工具数量">{testResult.toolCount}</Descriptions.Item>}
                        {testResult.error && <Descriptions.Item label="错误">{testResult.error}</Descriptions.Item>}
                    </Descriptions>
                ) : null}
            </Modal>

            {/* Add/Edit Modal */}
            <Modal title={editing ? '编辑 MCP 服务' : '添加 MCP 服务'} open={modalOpen}
                   onOk={handleSave} onCancel={() => {
                setModalOpen(false);
                setEditing(null);
                form.resetFields()
            }}>
                <Form form={form} layout="vertical"
                      initialValues={{transportType: 'HTTP', timeout: 60, status: 'active'}}>
                    <Form.Item name="serverName" label="服务名称" rules={[{required: true}]}>
                        <Input placeholder="如: z-agent-mcp-impl-db"/>
                    </Form.Item>
                    <Form.Item name="transportType" label="传输类型">
                        <Select options={[{label: 'HTTP', value: 'HTTP'}, {label: 'STDIO', value: 'STDIO'}]}/>
                    </Form.Item>
                    <Form.Item name="url" label="URL" rules={[{required: true}]}>
                        <Input placeholder="http://localhost:8095/mcp"/>
                    </Form.Item>
                    <Form.Item name="authToken" label="Auth Token">
                        <Input.Password placeholder="Bearer token (可选)"/>
                    </Form.Item>
                    <Form.Item name="timeout" label="超时(秒)">
                        <InputNumber min={5} max={300} style={{width: '100%'}}/>
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                        <Select options={[{label: '启用', value: 'active'}, {label: '停用', value: 'inactive'}]}/>
                    </Form.Item>
                    <Form.Item name="remark" label="备注">
                        <TextArea rows={2}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
