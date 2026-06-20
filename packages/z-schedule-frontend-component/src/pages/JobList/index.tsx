import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Badge, Button, Card, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tag, Tooltip,} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PauseCircleOutlined,
    PlayCircleOutlined,
    PlusOutlined,
    ScheduleOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {jobApi} from '@/services/job';
import {BlockStrategy, JobInfo, JobStatus, RouteStrategy} from '@/types';
import './JobList.css';

const {Search} = Input;
const {Option} = Select;

const JobList: React.FC = () => {
    const navigate = useNavigate();
    const [jobs, setJobs] = useState<JobInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<number | undefined>();
    const [modalVisible, setModalVisible] = useState(false);
    const [editingJob, setEditingJob] = useState<JobInfo | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchJobs();
        // 定时刷新
        const timer = setInterval(fetchJobs, 10000);
        return () => clearInterval(timer);
    }, []);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            const data = await jobApi.getList();
            setJobs(data.list || []);
        } catch (error) {
            message.error('获取任务列表失败');
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = () => {
        setEditingJob(null);
        form.resetFields();
        setModalVisible(true);
    };

    const handleEdit = (job: JobInfo) => {
        setEditingJob(job);
        form.setFieldsValue(job);
        setModalVisible(true);
    };

    const handleSave = async (values: any) => {
        try {
            if (editingJob) {
                await jobApi.update({...values, id: editingJob.id});
                message.success('任务更新成功');
            } else {
                await jobApi.add(values);
                message.success('任务创建成功');
            }
            setModalVisible(false);
            fetchJobs();
        } catch (error) {
            message.error('保存失败');
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await jobApi.remove(id);
            message.success('任务删除成功');
            fetchJobs();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleStart = async (id: number) => {
        try {
            await jobApi.start(id);
            message.success('任务启动成功');
            fetchJobs();
        } catch (error) {
            message.error('启动失败');
        }
    };

    const handleStop = async (id: number) => {
        try {
            await jobApi.stop(id);
            message.success('任务停止成功');
            fetchJobs();
        } catch (error) {
            message.error('停止失败');
        }
    };

    const handleTrigger = async (id: number) => {
        try {
            await jobApi.trigger(id);
            message.success('任务触发成功');
        } catch (error) {
            message.error('触发失败');
        }
    };

    const filteredJobs = jobs.filter((job) => {
        const matchSearch = !searchText ||
            job.jobDesc?.toLowerCase().includes(searchText.toLowerCase()) ||
            job.executorHandler?.toLowerCase().includes(searchText.toLowerCase());
        const matchStatus = statusFilter === undefined || job.triggerStatus === statusFilter;
        return matchSearch && matchStatus;
    });

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            width: 60,
        },
        {
            title: '任务描述',
            dataIndex: 'jobDesc',
            width: 200,
            render: (text: string, record: JobInfo) => (
                <div>
                    <div style={{fontWeight: 500}}>{text}</div>
                    <div style={{fontSize: 12, color: '#8c8c8c'}}>
                        Handler: {record.executorHandler}
                    </div>
                </div>
            ),
        },
        {
            title: 'Cron表达式',
            dataIndex: 'jobCron',
            width: 150,
            render: (text: string) => (
                <Tag icon={<ScheduleOutlined/>} color="blue">
                    {text}
                </Tag>
            ),
        },
        {
            title: '路由策略',
            dataIndex: 'executorRouteStrategy',
            width: 120,
            render: (text: RouteStrategy) => {
                const strategyMap: Record<string, string> = {
                    ROUND: '轮询',
                    RANDOM: '随机',
                    CONSISTENT_HASH: '一致性哈希',
                    LRU: '最近最少使用',
                    FAILOVER: '故障转移',
                    SHARDING_BROADCAST: '分片广播',
                };
                return <Tag>{strategyMap[text] || text}</Tag>;
            },
        },
        {
            title: '状态',
            dataIndex: 'triggerStatus',
            width: 100,
            render: (status: JobStatus) => (
                <Badge
                    status={status === JobStatus.RUNNING ? 'processing' : 'default'}
                    text={status === JobStatus.RUNNING ? '运行中' : '已停止'}
                    color={status === JobStatus.RUNNING ? '#52c41a' : '#8c8c8c'}
                />
            ),
        },
        {
            title: '操作',
            key: 'action',
            width: 200,
            fixed: 'right',
            render: (_: any, record: JobInfo) => (
                <Space size="small">
                    <Tooltip title="查看详情">
                        <Button
                            type="text"
                            icon={<EyeOutlined/>}
                            onClick={() => navigate(`/jobs/${record.id}`)}
                        />
                    </Tooltip>
                    <Tooltip title="编辑">
                        <Button
                            type="text"
                            icon={<EditOutlined/>}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Tooltip title="手动触发">
                        <Button
                            type="text"
                            icon={<ThunderboltOutlined/>}
                            onClick={() => handleTrigger(record.id)}
                        />
                    </Tooltip>
                    {record.triggerStatus === JobStatus.STOPPED ? (
                        <Tooltip title="启动">
                            <Button
                                type="text"
                                icon={<PlayCircleOutlined style={{color: '#52c41a'}}/>}
                                onClick={() => handleStart(record.id)}
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip title="停止">
                            <Button
                                type="text"
                                icon={<PauseCircleOutlined style={{color: '#ff4d4f'}}/>}
                                onClick={() => handleStop(record.id)}
                            />
                        </Tooltip>
                    )}
                    <Popconfirm
                        title="确定要删除这个任务吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Tooltip title="删除">
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined/>}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className="job-list">
            <Card
                title="任务列表"
                extra={
                    <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
                        新增任务
                    </Button>
                }
            >
                <div className="table-toolbar">
                    <Space>
                        <Search
                            placeholder="搜索任务描述/Handler"
                            allowClear
                            onSearch={(value) => setSearchText(value)}
                            style={{width: 250}}
                        />
                        <Select
                            placeholder="任务状态"
                            allowClear
                            style={{width: 120}}
                            onChange={(value) => setStatusFilter(value)}
                        >
                            <Option value={JobStatus.RUNNING}>运行中</Option>
                            <Option value={JobStatus.STOPPED}>已停止</Option>
                        </Select>
                    </Space>
                </div>
                <Table
                    columns={columns}
                    dataSource={filteredJobs}
                    rowKey="id"
                    loading={loading}
                    scroll={{x: 1500}}
                    pagination={{
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                />
            </Card>

            {/* 新增/编辑任务弹窗 */}
            <Modal
                title={editingJob ? '编辑任务' : '新增任务'}
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                onOk={() => form.submit()}
                width={700}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSave}
                    initialValues={{
                        executorTimeout: 0,
                        executorFailRetryCount: 0,
                        executorRouteStrategy: RouteStrategy.ROUND,
                        executorBlockStrategy: BlockStrategy.SERIAL_EXECUTION,
                    }}
                >
                    <Form.Item
                        name="jobDesc"
                        label="任务描述"
                        rules={[{required: true, message: '请输入任务描述'}]}
                    >
                        <Input placeholder="请输入任务描述"/>
                    </Form.Item>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item
                                name="jobCron"
                                label="Cron表达式"
                                rules={[{required: true, message: '请输入Cron表达式'}]}
                            >
                                <Input placeholder="如: 0 0 * * * ?"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item
                                name="executorHandler"
                                label="执行器Handler"
                                rules={[{required: true, message: '请输入执行器Handler'}]}
                            >
                                <Input placeholder="如: demoJobHandler"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="executorRouteStrategy" label="路由策略">
                                <Select>
                                    <Option value={RouteStrategy.ROUND}>轮询</Option>
                                    <Option value={RouteStrategy.RANDOM}>随机</Option>
                                    <Option value={RouteStrategy.CONSISTENT_HASH}>一致性哈希</Option>
                                    <Option value={RouteStrategy.LRU}>最近最少使用</Option>
                                    <Option value={RouteStrategy.FAILOVER}>故障转移</Option>
                                    <Option value={RouteStrategy.SHARDING_BROADCAST}>分片广播</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="executorBlockStrategy" label="阻塞策略">
                                <Select>
                                    <Option value={BlockStrategy.SERIAL_EXECUTION}>串行执行</Option>
                                    <Option value={BlockStrategy.DISCARD_LATER}>丢弃后续</Option>
                                    <Option value={BlockStrategy.COVER_EARLY}>覆盖之前</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="executorTimeout" label="超时时间(秒)">
                                <Input type="number" min={0} placeholder="0表示不限制"/>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="executorFailRetryCount" label="失败重试次数">
                                <Input type="number" min={0} placeholder="0表示不重试"/>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="executorParam" label="任务参数">
                        <Input.TextArea rows={3} placeholder="请输入任务参数，JSON格式"/>
                    </Form.Item>

                    <Form.Item name="alarmEmail" label="报警邮件">
                        <Input placeholder="多个邮箱用逗号分隔"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default JobList;
