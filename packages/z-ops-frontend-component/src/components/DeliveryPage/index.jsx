/**
 * 环境管理 (Environment CRUD)
 */
import {useEffect, useState} from 'react'
import {Button, Drawer, Form, Input, InputNumber, message, Modal, Select, Space, Switch, Table, Tag} from 'antd'
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons'
import {environmentApi, targetApi} from '../../api'

const DeliveryPage = () => {
    const [data, setData] = useState([])
    const [targets, setTargets] = useState([])
    const [loading, setLoading] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [editing, setEditing] = useState(null)
    const [form] = Form.useForm()

    const fetchData = async () => {
        setLoading(true)
        try { const [envRes, tRes] = await Promise.all([environmentApi.list(), targetApi.list()]); setData(envRes || []); setTargets(tRes || []) }
        catch { message.error('加载失败') } finally { setLoading(false) }
    }
    useEffect(() => { fetchData() }, [])

    const handleAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({status: 'ENABLE', sort: 0, autoDeploy: 0}); setDrawerVisible(true) }
    const handleEdit = (r) => { setEditing(r); form.setFieldsValue(r); setDrawerVisible(true) }
    const handleDelete = (r) => { Modal.confirm({title: '确认删除', content: `删除环境 ${r.name}？`, onOk: async () => { await environmentApi.delete(r.id); message.success('删除成功'); fetchData() }}) }
    const handleSubmit = async () => {
        try {
            const v = await form.validateFields()
            const payload = {...v, autoDeploy: v.autoDeploy ? 1 : 0}
            editing ? await environmentApi.update({...payload, id: editing.id}) : await environmentApi.create(payload)
            message.success(editing ? '更新成功' : '创建成功'); setDrawerVisible(false); fetchData()
        } catch {}
    }

    const targetMap = Object.fromEntries(targets.map(t => [t.id, t.name]))
    const columns = [
        {title: '名称', dataIndex: 'name', width: 120},
        {title: '编码', dataIndex: 'code', width: 100},
        {title: '关联渠道', dataIndex: 'targetId', width: 140, render: v => targetMap[v] || '-'},
        {title: '自动部署', dataIndex: 'autoDeploy', width: 90, render: v => v ? <Tag color="green">是</Tag> : <Tag>否</Tag>},
        {title: '描述', dataIndex: 'description', ellipsis: true},
        {title: '状态', dataIndex: 'status', width: 80, render: v => <Tag color={v === 'ENABLE' ? 'green' : 'red'}>{v === 'ENABLE' ? '启用' : '禁用'}</Tag>},
        {title: '操作', width: 160, render: (_, r) => (<Space size="small"><Button size="small" type="text" icon={<EditOutlined/>} onClick={() => handleEdit(r)}>编辑</Button><Button size="small" type="text" danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r)}>删除</Button></Space>)}
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}>环境管理</h2><span style={{color: '#8a8f98', fontSize: 14}}>管理部署环境 (开发 / 测试 / 预发 / 生产)</span></div>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>新建环境</Button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{pageSize: 10}} locale={{emptyText: '暂无环境'}}/>
            </div>
            <Drawer title={editing ? '编辑环境' : '新建环境'} placement="right" width={520} open={drawerVisible} onClose={() => setDrawerVisible(false)}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Space style={{display: 'flex'}} size="middle">
                        <Form.Item name="name" label="名称" rules={[{required: true}]} style={{flex: 1}}><Input placeholder="如: 生产环境"/></Form.Item>
                        <Form.Item name="code" label="编码" rules={[{required: true}]} style={{flex: 1}}><Input placeholder="如: prod"/></Form.Item>
                    </Space>
                    <Form.Item name="targetId" label="关联部署渠道"><Select allowClear placeholder="选择部署目标">{targets.map(t => <Select.Option key={t.id} value={t.id}>{t.name}</Select.Option>)}</Select></Form.Item>
                    <Space style={{display: 'flex'}} size="middle">
                        <Form.Item name="sort" label="排序" style={{flex: 1}}><InputNumber min={0}/></Form.Item>
                        <Form.Item name="autoDeploy" label="自动部署" valuePropName="checked" style={{flex: 1}}><Switch/></Form.Item>
                    </Space>
                    <Form.Item name="description" label="描述"><Input.TextArea rows={2}/></Form.Item>
                    <Form.Item name="config" label="配置 (JSON)"><Input.TextArea rows={3}/></Form.Item>
                    <Form.Item name="status" label="状态" initialValue="ENABLE"><Select><Select.Option value="ENABLE">启用</Select.Option><Select.Option value="DISABLE">禁用</Select.Option></Select></Form.Item>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                        <Button onClick={() => setDrawerVisible(false)}>取消</Button><Button type="primary" htmlType="submit">保存</Button>
                    </div>
                </Form>
            </Drawer>
        </div>
    )
}
export default DeliveryPage
