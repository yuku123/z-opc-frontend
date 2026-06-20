/**
 * 渠道管理 (DeploymentTarget CRUD)
 */
import {useEffect, useState} from 'react'
import {Button, Drawer, Form, Input, InputNumber, message, Modal, Select, Space, Table, Tag} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons'
import {targetApi} from '../../api'

const ChannelPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form] = Form.useForm()

    const fetchData = async () => {
        setLoading(true)
        try { setData(await targetApi.list() || []) } catch { message.error('加载失败') }
        finally { setLoading(false) }
    }

    useEffect(() => { fetchData() }, [])

    const handleAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({type: 'k8s', status: 'ENABLE', port: 22}); setDrawerVisible(true) }
    const handleEdit = (r) => { setEditing(r); form.setFieldsValue(r); setDrawerVisible(true) }
    const handleDelete = (r) => { Modal.confirm({title: '确认删除', content: `删除 ${r.name}？`, onOk: async () => { await targetApi.delete(r.id); message.success('删除成功'); fetchData() }}) }
    const handleSubmit = async () => {
        try {
            const v = await form.validateFields()
            editing ? await targetApi.update({...v, id: editing.id}) : await targetApi.create(v)
            message.success(editing ? '更新成功' : '创建成功'); setDrawerVisible(false); fetchData()
        } catch {}
    }

    const typeMap = {k8s: {text: 'K8s', color: 'blue'}, docker: {text: 'Docker', color: 'cyan'}, vm: {text: 'VM', color: 'orange'}, serverless: {text: 'Serverless', color: 'purple'}}
    const columns = [
        {title: '名称', dataIndex: 'name', width: 150},
        {title: '类型', dataIndex: 'type', width: 110, render: v => { const t = typeMap[v] || {text: v, color: 'default'}; return <Tag color={t.color}>{t.text}</Tag> }},
        {title: '主机', dataIndex: 'host', ellipsis: true},
        {title: '端口', dataIndex: 'port', width: 70},
        {title: '命名空间', dataIndex: 'namespace', width: 120},
        {title: '状态', dataIndex: 'status', width: 80, render: v => <Tag color={v === 'ENABLE' ? 'green' : 'red'}>{v === 'ENABLE' ? '启用' : '禁用'}</Tag>},
        {title: '操作', width: 160, render: (_, r) => (<Space size="small"><Button size="small" type="text" icon={<EditOutlined/>} onClick={() => handleEdit(r)}>编辑</Button><Button size="small" type="text" danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r)}>删除</Button></Space>)}
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}>渠道管理</h2><span style={{color: '#8a8f98', fontSize: 14}}>管理部署目标 (Kubernetes / Docker / VM)</span></div>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>新建渠道</Button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{pageSize: 10}} locale={{emptyText: '暂无部署目标'}}/>
            </div>
            <Drawer title={editing ? '编辑渠道' : '新建渠道'} placement="right" width={520} open={drawerVisible} onClose={() => setDrawerVisible(false)}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="名称" rules={[{required: true}]}><Input placeholder="如: prod-k8s-cluster"/></Form.Item>
                    <Form.Item name="type" label="类型" rules={[{required: true}]}>
                        <Select><Select.Option value="k8s">Kubernetes</Select.Option><Select.Option value="docker">Docker</Select.Option><Select.Option value="vm">虚拟机</Select.Option><Select.Option value="serverless">Serverless</Select.Option></Select>
                    </Form.Item>
                    <Space style={{display: 'flex'}} size="middle">
                        <Form.Item name="host" label="主机地址" rules={[{required: true}]} style={{flex: 1}}><Input placeholder="192.168.1.100"/></Form.Item>
                        <Form.Item name="port" label="端口"><InputNumber min={1} max={65535}/></Form.Item>
                    </Space>
                    <Space style={{display: 'flex'}} size="middle">
                        <Form.Item name="username" label="用户名" style={{flex: 1}}><Input placeholder="root"/></Form.Item>
                        <Form.Item name="namespace" label="命名空间" style={{flex: 1}}><Input placeholder="default"/></Form.Item>
                    </Space>
                    <Form.Item name="authPath" label="密钥路径"><Input placeholder="~/.ssh/id_rsa"/></Form.Item>
                    <Form.Item name="description" label="描述"><Input.TextArea rows={2}/></Form.Item>
                    <Form.Item name="status" label="状态" initialValue="ENABLE"><Select><Select.Option value="ENABLE">启用</Select.Option><Select.Option value="DISABLE">禁用</Select.Option></Select></Form.Item>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                        <Button onClick={() => setDrawerVisible(false)}>取消</Button><Button type="primary" htmlType="submit">保存</Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    )
}
export default ChannelPage
