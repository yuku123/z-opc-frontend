import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button, Card, Form, Input, message} from 'antd';
import {LockOutlined, UserOutlined} from '@ant-design/icons';
import './index.css';

function Login() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (values) => {
        setLoading(true);
        try {
            // 模拟登录（实际项目中调用后端接口）
            const token = 'mock-token-' + Date.now();
            localStorage.setItem('token', token);
            localStorage.setItem('username', values.username);
            message.success('登录成功');
            navigate('/dashboard');
        } catch (error) {
            message.error(error.message || '登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <Card className="login-card" title="z-meta 元数据平台" bordered={false}>
                <Form
                    name="login"
                    onFinish={handleSubmit}
                    autoComplete="off"
                >
                    <Form.Item
                        name="username"
                        rules={[{required: true, message: '请输入用户名'}]}
                    >
                        <Input
                            prefix={<UserOutlined/>}
                            placeholder="用户名: admin"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{required: true, message: '请输入密码'}]}
                    >
                        <Input.Password
                            prefix={<LockOutlined/>}
                            placeholder="密码: admin"
                            size="large"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block size="large">
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
}

export default Login;