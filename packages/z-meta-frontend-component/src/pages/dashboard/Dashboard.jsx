import React from 'react';
import {Card, Col, Row, Statistic} from 'antd';
import {ApiOutlined, AppstoreOutlined, BookOutlined, UserOutlined,} from '@ant-design/icons';

function Dashboard() {
    return (
        <div>
            <h1>欢迎使用 z-meta 元数据平台</h1>
            <Row gutter={16}>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="租户数量"
                            value={1}
                            prefix={<UserOutlined/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="应用数量"
                            value={0}
                            prefix={<AppstoreOutlined/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="字典类型"
                            value={0}
                            prefix={<BookOutlined/>}
                        />
                    </Card>
                </Col>
                <Col span={6}>
                    <Card>
                        <Statistic
                            title="接口数量"
                            value={0}
                            prefix={<ApiOutlined/>}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Dashboard;