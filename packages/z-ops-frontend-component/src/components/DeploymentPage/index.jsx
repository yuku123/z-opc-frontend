/**
 * 部署单元 (DeploymentUnit CRUD + deploy)
 */
import {useEffect, useState} from 'react'
import {Button, Drawer, Form, Input, message, Modal, Select, Space, Table, Tag} from 'antd'
import {DeleteOutlined, EditOutlined, PlayCircleOutlined, PlusOutlined, SyncOutlined} from '@ant-design/icons'
import {deploymentUnitApi} from '../../api'

const DeploymentPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [drawerVisible, setDrawerVisible] = useState(false)
    const [logVisible, setLogVisible] = useState(false)
    const [editing, setEditing] = useState(null)
    const [deploying, setDeploying] = useState(null)
    const [deployLog, setDeployLog] = useState('')
    const [form] = Form.useForm()

    const fetchData = async () => { setLoading(true); try { setData(await deploymentUnitApi.list() || []) } catch { message.error('加载失败') } finally { setLoading(false) } }
    useEffect(() => { fetchData() }, [])

    const handleAdd = () => { setEditing(null); form.resetFields(); form.setFieldsValue({status: 'ENABLE', gitBranch: 'main'}); setDrawerVisible(true) }
    const handleEdit = (r) => { setEditing(r); form.setFieldsValue(r); setDrawerVisible(true) }
    const handleDelete = (r) => { Modal.confirm({title: '确认删除', content: `删除 ${r.name}？`, onOk: async () => { await deploymentUnitApi.delete(r.id); message.success('删除成功'); fetchData() }}) }
    const handleDeploy = async (r) => { setDeploying(r.id); setLogVisible(true); setDeployLog('正在部署...\n'); try { const res = await deploymentUnitApi.deploy(r.id); setDeployLog(res || '部署完成') } catch (e) { setDeployLog('部署失败: ' + (e.message || '未知错误')) } finally { setDeploying(null) } }
    const handleSubmit = async () => {
        try {
            const v = await form.validateFields()
            editing ? await deploymentUnitApi.update({...v, id: editing.id}) : await deploymentUnitApi.create(v)
            message.success(editing ? '更新成功' : '创建成功'); setDrawerVisible(false); fetchData()
        } catch {}
    }

    const columns = [
        {title: '名称', dataIndex: 'name', width: 150},
        {title: 'Git 仓库', dataIndex: 'gitRepo', ellipsis: true},
        {title: '分支', dataIndex: 'gitBranch', width: 100},
        {title: '工作目录', dataIndex: 'workDir', ellipsis: true},
        {title: '状态', dataIndex: 'status', width: 80, render: v => <Tag color={v === 'ENABLE' ? 'green' : 'red'}>{v === 'ENABLE' ? '启用' : '禁用'}</Tag>},
        {title: '操作', width: 240, render: (_, r) => (<Space size="small">
            <Button size="small" type="text" icon={<PlayCircleOutlined spin={deploying === r.id}/>} onClick={() => handleDeploy(r)} disabled={deploying !== null}>{deploying === r.id ? '部署中' : '部署'}</Button>
            <Button size="small" type="text" icon={<EditOutlined/>} onClick={() => handleEdit(r)}>编辑</Button>
            <Button size="small" type="text" danger icon={<DeleteOutlined/>} onClick={() => handleDelete(r)}>删除</Button>
        </Space>)}
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}>部署单元</h2><span style={{color: '#8a8f98', fontSize: 14}}>管理 Git 仓库部署配置</span></div>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>新建部署单元</Button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{pageSize: 10}} locale={{emptyText: '暂无部署单元'}}/>
            </div>
            <Drawer title={editing ? '编辑部署单元' : '新建部署单元'} placement="right" width={520} open={drawerVisible} onClose={() => setDrawerVisible(false)}>
                <Form form={form} layout="vertical" onFinish={handleSubmit}>
                    <Form.Item name="name" label="名称" rules={[{required: true}]}><Input placeholder="如: z-agent-backend"/></Form.Item>
                    <Form.Item name="description" label="描述"><Input.TextArea rows={2}/></Form.Item>
                    <Form.Item name="status" label="状态" initialValue="ENABLE"><Select><Select.Option value="ENABLE">启用</Select.Option><Select.Option value="DISABLE">禁用</Select.Option></Select></Form.Item>
                    <Form.Item name="gitRepo" label="Git 仓库地址" rules={[{required: true}]}><Input placeholder="https://github.com/username/repo.git"/></Form.Item>
                    <Form.Item name="gitBranch" label="分支" initialValue="main"><Input placeholder="main"/></Form.Item>
                    <Form.Item name="workDir" label="本地工作目录" rules={[{required: true}]}><Input placeholder="/deploy/my-app"/></Form.Item>
                    <Form.Item name="buildCommand" label="构建命令"><Input.TextArea rows={2} placeholder="mvn clean package -DskipTests"/></Form.Item>
                    <Form.Item name="deployCommand" label="部署命令"><Input.TextArea rows={2}/></Form.Item>
                    <Form.Item name="healthCheckUrl" label="健康检查 URL"><Input placeholder="http://localhost:8080/actuator/health"/></Form.Item>
                    <Form.Item name="envVars" label="环境变量 (JSON)"><Input.TextArea rows={3}/></Form.Item>
                    <div style={{display: 'flex', justifyContent: 'flex-end', gap: 12, paddingTop: 24, borderTop: '1px solid rgba(255,255,255,0.06)'}}>
                        <Button onClick={() => setDrawerVisible(false)}>取消</Button><Button type="primary" htmlType="submit">保存</Button>
                    </div>
                </Form>
            </Drawer>
            <Drawer title={<div style={{display: 'flex', alignItems: 'center', gap: 8}}><SyncOutlined spin={deploying !== null}/><span>{deploying ? '部署中' : '部署完成'}</span></div>} placement="right" width={600} open={logVisible} onClose={() => setLogVisible(false)}>
                <pre style={{background: '#0a0a0f', color: '#d0d6e0', padding: 16, borderRadius: 6, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.6, maxHeight: 500, overflow: 'auto', whiteSpace: 'pre-wrap'}}>{deployLog}</pre>
            </Drawer>
        </div>
    )
}
export default DeploymentPage
