import {useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button, Card, Form, Input, message} from 'antd'
import {LockOutlined, UserOutlined} from '@ant-design/icons'

function Login() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const onFinish = async (values) => {
        setLoading(true)
        try {
            // 简化版登录，实际应该调用后端接口
            if (values.username === 'admin' && values.password === 'admin') {
                localStorage.setItem('token', 'mock-token')
                message.success('登录成功')
                navigate('/')
            } else {
                message.error('用户名或密码错误')
            }
        } catch (error) {
            message.error('登录失败')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
            <Card
                title={<div style={{textAlign: 'center', fontSize: 24}}>z-mist 密钥管理平台</div>}
                style={{width: 400}}
            >
                <Form
                    name="login"
                    onFinish={onFinish}
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
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            size="large"
                            block
                        >
                            登录
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    )
}

export default Login