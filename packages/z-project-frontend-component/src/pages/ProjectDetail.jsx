import {useEffect, useRef, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import {Alert, Button, Card, Empty, Input, message, Popconfirm, Space, Spin, Statistic, Tag} from 'antd'
import {ApiOutlined, ArrowLeftOutlined, CheckCircleOutlined, RobotOutlined, SendOutlined, UserOutlined} from '@ant-design/icons'
import request from '../utils/request'

const ROLE_META = {
    USER: {color: 'blue', icon: <UserOutlined/>, label: 'CEO'},
    ASSISTANT: {color: 'purple', icon: <RobotOutlined/>, label: 'Agent'},
    SYSTEM: {color: 'default', icon: null, label: '系统'},
}

const STATUS_TAG = {
    OPEN: {color: 'blue', text: '待开始'},
    IN_PROGRESS: {color: 'green', text: '进行中'},
    COMPLETED: {color: 'default', text: '已完成'},
    ARCHIVED: {color: 'default', text: '已归档'},
}

function ProjectDetail() {
    const {id} = useParams()
    const navigate = useNavigate()
    const [project, setProject] = useState(null)
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const chatRef = useRef(null)

    useEffect(() => {
        if (id) loadAll()
    }, [id])

    useEffect(() => {
        // 滚到底
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight
        }
    }, [messages])

    const loadAll = async () => {
        try {
            const [p, m] = await Promise.all([
                request.get(`/project/${id}`),
                request.get(`/project/${id}/messages`),
            ])
            setProject(p?.data ?? p)
            setMessages(Array.isArray(m?.data ?? m) ? (m?.data ?? m) : [])
        } catch (e) {
            message.error('加载项目失败')
        }
    }

    const handleSend = async () => {
        if (!input.trim()) return
        const text = input.trim()
        setInput('')
        setSending(true)
        // 乐观: 先把 user 消息渲染出去
        const tempUser = {seq: -1, role: 'USER', content: text, createdAt: new Date().toISOString()}
        setMessages(prev => [...prev, tempUser])
        try {
            const res = await request.post(`/project/${id}/chat`, {message: text})
            if (res && res.success !== false) {
                const r = res.data ?? res
                const a = r.message
                setMessages(prev => {
                    // 去掉临时的 user, 换成后端返回的完整序列
                    const filtered = prev.filter(m => m.seq !== -1)
                    return [...filtered, ...(a ? [a] : [])]
                })
                // 重新拉一次保证 seq 对齐
                setTimeout(loadAll, 100)
            } else {
                message.error(res?.message || '发送失败')
            }
        } catch (e) {
            message.error('发送失败: ' + (e?.message || ''))
        } finally {
            setSending(false)
        }
    }

    const handleComplete = async () => {
        try {
            const res = await request.post(`/project/${id}/status?status=COMPLETED`)
            if (res && res.success !== false) {
                message.success('已标记完成')
                loadAll()
            }
        } catch (e) {
            message.error('操作失败')
        }
    }

    if (!project) return <div style={{padding: 24}}><Spin/></div>

    const status = STATUS_TAG[project.status] || {color: 'default', text: project.status}

    return (
        <div style={{padding: 24, height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', gap: 16}}>
            {/* 头部 */}
            <Card
                title={
                    <Space>
                        <Button type="text" icon={<ArrowLeftOutlined/>} onClick={() => navigate('/project/list')}/>
                        <ApiOutlined/>
                        <span style={{fontWeight: 500}}>{project.name}</span>
                        <Tag color={status.color}>{status.text}</Tag>
                    </Space>
                }
                extra={
                    <Space>
                        {project.contextSize > 0 && <Tag color="blue">上下文 {project.contextSize} B</Tag>}
                        <Tag>{project.agentRole}</Tag>
                        {project.modelCode && <Tag color="purple">{project.modelCode}</Tag>}
                        {project.status !== 'COMPLETED' && project.status !== 'ARCHIVED' && (
                            <Popconfirm title="标记完成?" onConfirm={handleComplete}>
                                <Button icon={<CheckCircleOutlined/>}>标记完成</Button>
                            </Popconfirm>
                        )}
                    </Space>
                }
            >
                {project.description && <div style={{color: '#666', marginBottom: 8}}>{project.description}</div>}
                <Space size="large">
                    <Statistic title="消息数" value={project.messageCount || 0}/>
                    {project.sourceSubscriptionId && (
                        <Statistic title="来源订阅" value={`#${project.sourceSubscriptionId}`}/>
                    )}
                    <Statistic title="立项" value={project.createdAt ? new Date(project.createdAt).toLocaleString() : '-'}/>
                </Space>
            </Card>

            {/* 聊天区 */}
            <Card style={{flex: 1, display: 'flex', flexDirection: 'column'}}
                  bodyStyle={{flex: 1, display: 'flex', flexDirection: 'column', padding: 0}}>
                <div ref={chatRef} style={{flex: 1, overflow: 'auto', padding: 16, background: '#fafafa'}}>
                    {messages.length === 0 ? (
                        <Empty description="还没有消息, 跟 Agent 说点什么?"/>
                    ) : (
                        <Space orientation="vertical" style={{width: '100%'}} size="middle">
                            {messages.map(m => {
                                const meta = ROLE_META[m.role] || ROLE_META.SYSTEM
                                const isUser = m.role === 'USER'
                                return (
                                    <div key={m.id || m.seq} style={{
                                        display: 'flex',
                                        justifyContent: isUser ? 'flex-end' : 'flex-start',
                                    }}>
                                        <div style={{
                                            maxWidth: '70%',
                                            background: isUser ? '#1677ff' : '#fff',
                                            color: isUser ? '#fff' : '#000',
                                            border: isUser ? 'none' : '1px solid #e8e8e8',
                                            borderRadius: 8,
                                            padding: '10px 14px',
                                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                                        }}>
                                            <div style={{fontSize: 12, opacity: 0.7, marginBottom: 4}}>
                                                <Space size={4}>
                                                    {meta.icon}
                                                    {meta.label}
                                                    {m.seq > 0 && <span>#{m.seq}</span>}
                                                    {m.latencyMs > 0 && <span>· {m.latencyMs}ms</span>}
                                                    {m.modelCode && <span>· {m.modelCode}</span>}
                                                </Space>
                                            </div>
                                            <div style={{whiteSpace: 'pre-wrap', wordBreak: 'break-word'}}>
                                                {m.content}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                            {sending && (
                                <div style={{display: 'flex', justifyContent: 'flex-start'}}>
                                    <div style={{background: '#fff', border: '1px solid #e8e8e8', borderRadius: 8, padding: '10px 14px'}}>
                                        <Spin size="small"/> 思考中...
                                    </div>
                                </div>
                            )}
                        </Space>
                    )}
                </div>
                {project.status === 'COMPLETED' || project.status === 'ARCHIVED' ? (
                    <Alert style={{margin: 12, marginBottom: 0}}
                           type="info" message="项目已完成 / 归档, 不再接受新消息"
                           showIcon/>
                ) : (
                    <div style={{borderTop: '1px solid #f0f0f0', padding: 12, display: 'flex', gap: 8}}>
                        <Input.TextArea
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            onPressEnter={e => { if (!e.shiftKey) { e.preventDefault(); handleSend() } }}
                            placeholder="输入消息, Enter 发送 (Shift+Enter 换行)"
                            autoSize={{minRows: 1, maxRows: 6}}
                            disabled={sending}
                        />
                        <Button type="primary" icon={<SendOutlined/>} loading={sending} onClick={handleSend}
                                disabled={!input.trim()}>发送</Button>
                    </div>
                )}
            </Card>
        </div>
    )
}

export default ProjectDetail
