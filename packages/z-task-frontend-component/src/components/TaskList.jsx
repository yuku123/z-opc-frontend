import {useEffect, useState} from 'react'
import {Card, Table, Button, Modal, Form, Input, Select, Space, message, Tag} from 'antd'
import {PlusOutlined, CheckOutlined} from '@ant-design/icons'
import {taskApi} from '../api'

/**
 * 任务管理 (从 z-opc-main-starter-frontend/src/pages/task/task/TaskList.jsx 迁入).
 *
 * Props:
 *   - apiBaseURL?: string  后端 baseURL, 默认 '/api'
 */
export default function TaskList({apiBaseURL}) {
    const [projects, setProjects] = useState([])
    const [projectId, setProjectId] = useState(null)
    const [tasks, setTasks] = useState([])
    const [loading, setLoading] = useState(false)
    const [modalOpen, setModalOpen] = useState(false)
    const [form] = Form.useForm()

    const loadProjects = async () => {
        try {
            const res = await taskApi.listMyProjects()
            const list = res?.data || res || []
            setProjects(list)
            if (list.length > 0 && !projectId) setProjectId(list[0].id)
        } catch (e) {
            message.error('加载项目失败: ' + (e?.message || e))
        }
    }

    const loadTasks = async (pid) => {
        if (!pid) { setTasks([]); return }
        setLoading(true)
        try {
            const res = await taskApi.listTasksByProject(pid)
            setTasks(res?.data || res || [])
        } catch (e) {
            message.error('加载任务失败: ' + (e?.message || e))
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadProjects() }, [])
    useEffect(() => { loadTasks(projectId) }, [projectId])

    const onCreate = () => {
        if (!projectId) {
            message.warning('请先选择项目')
            return
        }
        form.resetFields()
        form.setFieldsValue({projectId, listId: 1, status: 1, priority: 1})
        setModalOpen(true)
    }

    const onSubmit = async () => {
        try {
            const values = await form.validateFields()
            await taskApi.createTask(values)
            message.success('任务已创建')
            setModalOpen(false)
            loadTasks(projectId)
        } catch (e) {
            if (e?.errorFields) return
            message.error('创建失败: ' + (e?.message || e))
        }
    }

    const onComplete = async (id) => {
        try {
            await taskApi.completeTask(id)
            message.success('任务已完成')
            loadTasks(projectId)
        } catch (e) {
            message.error('操作失败: ' + (e?.message || e))
        }
    }

    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '标题', dataIndex: 'title'},
        {title: '项目ID', dataIndex: 'projectId', width: 80},
        {title: '状态', dataIndex: 'status', width: 100,
          render: (s) => {
              const map = {0: '待办', 1: '进行中', 2: '已完成'}
              const color = {0: 'default', 1: 'blue', 2: 'green'}[s] || 'default'
              return <Tag color={color}>{map[s] || s}</Tag>
          },
        },
        {title: '优先级', dataIndex: 'priority', width: 80},
        {title: '截止时间', dataIndex: 'dueDate', width: 180},
        {
            title: '操作', width: 200, fixed: 'right',
            render: (_, row) => (
                <Space>
                    <Button size="small" type="primary" icon={<CheckOutlined/>}
                            onClick={() => onComplete(row.id)}
                            disabled={row.status === 2}>
                        完成
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Card
                title="任务管理"
                extra={
                    <Space>
                        <span>项目:</span>
                        <Select
                            value={projectId}
                            onChange={setProjectId}
                            style={{width: 240}}
                            placeholder="选择项目"
                            options={projects.map(p => ({label: p.name, value: p.id}))}
                        />
                        <Button type="primary" icon={<PlusOutlined/>} onClick={onCreate}>新建任务</Button>
                    </Space>
                }
            >
                <Table
                    rowKey="id"
                    columns={columns}
                    dataSource={tasks}
                    loading={loading}
                    pagination={{pageSize: 10}}
                />
            </Card>

            <Modal
                title="新建任务"
                open={modalOpen}
                onCancel={() => setModalOpen(false)}
                onOk={onSubmit}
                destroyOnHidden
            >
                <Form form={form} layout="vertical" preserve={false}>
                    <Form.Item name="title" label="任务标题" rules={[{required: true, message: '请输入任务标题'}]}>
                        <Input placeholder="例如: 实现 xx 功能"/>
                    </Form.Item>
                    <Form.Item name="projectId" label="所属项目" rules={[{required: true}]}>
                        <Select
                            options={projects.map(p => ({label: p.name, value: p.id}))}
                            placeholder="从数据库捞出的项目列表"
                        />
                    </Form.Item>
                    <Form.Item name="listId" label="列表ID" rules={[{required: true}]}>
                        <Input type="number" placeholder="默认 1"/>
                    </Form.Item>
                    <Form.Item name="priority" label="优先级" initialValue={1}>
                        <Select options={[{label: '低', value: 1}, {label: '中', value: 2}, {label: '高', value: 3}]}/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}
