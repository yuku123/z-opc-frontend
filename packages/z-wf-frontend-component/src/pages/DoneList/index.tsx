import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Empty, Input, Space, Table, Tag, Tooltip, Typography,} from 'antd';
import {EyeOutlined, HistoryOutlined, ReloadOutlined, SearchOutlined,} from '@ant-design/icons';
import {approvalApi} from '@/services/api';
import {PageResult, Task} from '@/types/workflow';
import dayjs from 'dayjs';
import styles from './index.module.css';

const {Title} = Typography;

const DoneList: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PageResult<Task>>({
        list: [],
        total: 0,
        pageNum: 1,
        pageSize: 10,
        pages: 0,
    });
    const [searchKeyword, setSearchKeyword] = useState('');

    const fetchDoneList = async (pageNum = 1, pageSize = 10) => {
        try {
            setLoading(true);
            const result = await approvalApi.getDoneList('admin', pageNum, pageSize);
            setData(result);
        } catch (error) {
            console.error('获取已办列表失败:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDoneList();
    }, []);

    const columns = [
        {
            title: '任务名称',
            dataIndex: 'name',
            key: 'name',
            render: (text: string) => (
                <span className={styles.taskName}>{text}</span>
            ),
        },
        {
            title: '所属流程',
            dataIndex: 'processDefinitionName',
            key: 'processDefinitionName',
            render: (text: string) => (
                <Tooltip title={text}>
                    <span className={styles.ellipsis}>{text}</span>
                </Tooltip>
            ),
        },
        {
            title: '处理结果',
            dataIndex: 'action',
            key: 'action',
            width: 120,
            render: (action: string) => (
                <Tag color={action === 'approve' ? 'success' : 'error'}>
                    {action === 'approve' ? '已通过' : '已驳回'}
                </Tag>
            ),
        },
        {
            title: '处理时间',
            dataIndex: 'endTime',
            key: 'endTime',
            width: 180,
            render: (time: string) => dayjs(time).format('YYYY-MM-DD HH:mm:ss'),
        },
        {
            title: '操作',
            key: 'action',
            width: 120,
            fixed: 'right',
            render: (_: any, record: Task) => (
                <Space size="small">
                    <Button
                        type="text"
                        icon={<EyeOutlined/>}
                        onClick={() => navigate(`/workflow/task/${record.id}`)}
                    >
                        查看
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className={styles.container}>
            <Card className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.titleSection}>
                        <Title level={4} className={styles.title}>
                            <HistoryOutlined className={styles.titleIcon}/>
                            已办任务
                        </Title>
                        <span className={styles.subtitle}>
              共 <strong>{data.total}</strong> 条记录
            </span>
                    </div>
                    <Space>
                        <Input
                            placeholder="搜索任务名称"
                            prefix={<SearchOutlined/>}
                            value={searchKeyword}
                            onChange={(e) => setSearchKeyword(e.target.value)}
                            style={{width: 240}}
                            allowClear
                        />
                        <Button
                            icon={<ReloadOutlined/>}
                            onClick={() => fetchDoneList(data.pageNum, data.pageSize)}
                        >
                            刷新
                        </Button>
                    </Space>
                </div>

                <Table
                    columns={columns}
                    dataSource={data.list}
                    rowKey="id"
                    loading={loading}
                    pagination={{
                        current: data.pageNum,
                        pageSize: data.pageSize,
                        total: data.total,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total) => `共 ${total} 条`,
                    }}
                    onChange={(pagination) => {
                        fetchDoneList(pagination.current, pagination.pageSize);
                    }}
                    locale={{
                        emptyText: (
                            <Empty
                                image={Empty.PRESENTED_IMAGE_SIMPLE}
                                description="暂无已办任务"
                            />
                        ),
                    }}
                />
            </Card>
        </div>
    );
};

export default DoneList;
