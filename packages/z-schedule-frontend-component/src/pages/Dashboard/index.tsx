import {useEffect, useState} from 'react';
import {Avatar, Card, Col, List, Progress, Row, Statistic, Tag, Timeline} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    ClusterOutlined,
    PlayCircleOutlined,
    ScheduleOutlined,
    SyncOutlined,
    ThunderboltOutlined,
} from '@ant-design/icons';
import {dashboardApi} from '../../services/job';
import {DashboardStats, ScheduleRecord} from '../../types/job';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [records, setRecords] = useState<ScheduleRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
        // 定时刷新
        const timer = setInterval(fetchDashboardData, 30000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        if (stats) {
            initCharts();
        }
    }, [stats]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            const [statsData, recordsData] = await Promise.all([
                dashboardApi.getStats(),
                dashboardApi.getScheduleRecords(10),
            ]);
            setStats(statsData);
            setRecords(recordsData);
        } catch (error) {
            console.error('获取仪表盘数据失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const initCharts = () => {
        // 成功率趋势图
        const trendChart = echarts.init(document.getElementById('trendChart') as HTMLElement);
        trendChart.setOption({
            tooltip: {trigger: 'axis'},
            grid: {left: '3%', right: '4%', bottom: '3%', containLabel: true},
            xAxis: {
                type: 'category',
                data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
            },
            yAxis: {type: 'value', max: 100, axisLabel: {formatter: '{value}%'}},
            series: [{
                name: '成功率',
                type: 'line',
                smooth: true,
                data: [98, 99, 97, 98, 96, 99, stats?.successRate || 98],
                areaStyle: {opacity: 0.3},
                itemStyle: {color: '#52c41a'},
            }],
        });

        // 任务分布饼图
        const pieChart = echarts.init(document.getElementById('pieChart') as HTMLElement);
        pieChart.setOption({
            tooltip: {trigger: 'item'},
            legend: {orient: 'vertical', right: '5%', top: 'center'},
            series: [{
                name: '任务状态',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {borderRadius: 10, borderColor: '#fff', borderWidth: 2},
                label: {show: false, position: 'center'},
                emphasis: {label: {show: true, fontSize: 20, fontWeight: 'bold'}},
                labelLine: {show: false},
                data: [
                    {value: stats?.runningJobCount || 0, name: '运行中', itemStyle: {color: '#52c41a'}},
                    {
                        value: (stats?.jobCount || 0) - (stats?.runningJobCount || 0),
                        name: '已停止',
                        itemStyle: {color: '#ff4d4f'}
                    },
                ],
            }],
        });

        // 响应式
        window.addEventListener('resize', () => {
            trendChart.resize();
            pieChart.resize();
        });
    };

    // 状态标签渲染
    const renderStatusTag = (status: string) => {
        switch (status) {
            case 'success':
                return <Tag icon={<CheckCircleOutlined/>} color="success">成功</Tag>;
            case 'fail':
                return <Tag icon={<CloseCircleOutlined/>} color="error">失败</Tag>;
            case 'running':
                return <Tag icon={<SyncOutlined spin/>} color="processing">执行中</Tag>;
            default:
                return <Tag>未知</Tag>;
        }
    };

    return (
        <div className="dashboard">
            {/* 统计卡片 */}
            <Row gutter={[16, 16]} className="stats-cards">
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="任务总数"
                            value={stats?.jobCount || 0}
                            prefix={<ScheduleOutlined/>}
                            valueStyle={{color: '#1677ff'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="运行中任务"
                            value={stats?.runningJobCount || 0}
                            prefix={<PlayCircleOutlined/>}
                            valueStyle={{color: '#52c41a'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="在线执行器"
                            value={stats?.executorCount || 0}
                            prefix={<ClusterOutlined/>}
                            valueStyle={{color: '#722ed1'}}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card loading={loading}>
                        <Statistic
                            title="今日调度次数"
                            value={stats?.todayTriggerCount || 0}
                            prefix={<ThunderboltOutlined/>}
                            valueStyle={{color: '#fa8c16'}}
                        />
                        <div className="success-rate">
                            成功率: <span style={{color: '#52c41a'}}>{stats?.successRate || 0}%</span>
                            &nbsp;|&nbsp;
                            失败率: <span style={{color: '#ff4d4f'}}>{stats?.failRate || 0}%</span>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* 图表区域 */}
            <Row gutter={[16, 16]} className="charts-row">
                <Col xs={24} lg={16}>
                    <Card title="调度成功率趋势（近7天）" loading={loading}>
                        <div id="trendChart" style={{height: 300}}/>
                    </Card>
                </Col>
                <Col xs={24} lg={8}>
                    <Card title="任务状态分布" loading={loading}>
                        <div id="pieChart" style={{height: 300}}/>
                    </Card>
                </Col>
            </Row>

            {/* 最近调度记录和执行器状态 */}
            <Row gutter={[16, 16]} className="bottom-row">
                <Col xs={24} lg={12}>
                    <Card
                        title="最近调度记录"
                        loading={loading}
                        extra={<a href="#/logs">查看更多</a>}
                    >
                        <Timeline
                            items={records.map((record) => ({
                                color: record.status === 'success' ? 'green' : record.status === 'fail' ? 'red' : 'blue',
                                dot: record.status === 'running' ? <SyncOutlined spin/> : null,
                                children: (
                                    <div className="timeline-item">
                                        <div className="time">{dayjs(record.time).format('HH:mm:ss')}</div>
                                        <div className="content">
                                            <span className="job-name">{record.jobDesc}</span>
                                            {renderStatusTag(record.status)}
                                            {record.duration && (
                                                <span className="duration">{record.duration}ms</span>
                                            )}
                                        </div>
                                    </div>
                                ),
                            }))}
                        />
                    </Card>
                </Col>
                <Col xs={24} lg={12}>
                    <Card title="执行器负载状态" loading={loading}>
                        <List
                            dataSource={[
                                {appName: 'order-service', instanceCount: 3, runningTasks: 12, cpu: 45, memory: 62},
                                {appName: 'pay-service', instanceCount: 2, runningTasks: 8, cpu: 38, memory: 55},
                                {appName: 'user-service', instanceCount: 2, runningTasks: 5, cpu: 25, memory: 40},
                                {
                                    appName: 'notification-service',
                                    instanceCount: 1,
                                    runningTasks: 3,
                                    cpu: 15,
                                    memory: 30
                                },
                            ]}
                            renderItem={(item) => (
                                <List.Item>
                                    <div style={{width: '100%'}}>
                                        <div
                                            style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8}}>
                                            <div>
                                                <Avatar size="small"
                                                        style={{backgroundColor: '#1677ff', marginRight: 8}}>
                                                    {item.appName[0].toUpperCase()}
                                                </Avatar>
                                                <span style={{fontWeight: 500}}>{item.appName}</span>
                                            </div>
                                            <div style={{color: '#8c8c8c'}}>
                                                <ClusterOutlined/> {item.instanceCount} 实例
                                                &nbsp;|&nbsp;
                                                <ScheduleOutlined/> {item.runningTasks} 任务
                                            </div>
                                        </div>
                                        <div style={{display: 'flex', gap: 24}}>
                                            <div style={{flex: 1}}>
                                                <div style={{fontSize: 12, color: '#8c8c8c', marginBottom: 4}}>
                                                    CPU: {item.cpu}%
                                                </div>
                                                <Progress percent={item.cpu} size="small" strokeColor="#1677ff"
                                                          showInfo={false}/>
                                            </div>
                                            <div style={{flex: 1}}>
                                                <div style={{fontSize: 12, color: '#8c8c8c', marginBottom: 4}}>
                                                    内存: {item.memory}%
                                                </div>
                                                <Progress percent={item.memory} size="small" strokeColor="#52c41a"
                                                          showInfo={false}/>
                                            </div>
                                        </div>
                                    </div>
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
