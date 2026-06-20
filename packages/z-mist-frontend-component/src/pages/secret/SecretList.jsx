import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {Button, message, Modal, Space, Table, Tag} from 'antd'
import {DeleteOutlined, EditOutlined, ExclamationCircleOutlined, PlusOutlined} from '@ant-design/icons'
import request from '../../utils/request'

function SecretList() {
    const navigate = useNavigate()
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)

    const fetchData = async () => {
        setLoading(true)
        try {
            const res = await request.get('/secret/list')
            if (res.success) {
                setData(res.data || [])
            }
        } catch (error) {
            message.error('获取密钥列表失败')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleDelete = (record) => {
        Modal.confirm({
            title: '确认删除',
            icon: <ExclamationCircleOutlined/>,
            content: `确定要删除密钥 "${record.secretName}" 吗？`,
            onOk: async () => {
                try {
                    const res = await request.delete(`/secret/${record.secretKey}?group=${record.group}&namespace=${record.namespace}`)
                    if (res.success) {
                        message.success('删除成功')
                        fetchData()
                    } else {
                        message.error(res.message || '删除失败')
                    }
                } catch (error) {
                    message.error('删除失败')
                }
            },
        })
    }

    const columns = [
        {
            title: '密钥名称',
            dataIndex: 'secretName',
            key: 'secretName',
        },
        {
            title: '密钥标识',
            dataIndex: 'secretKey',
            key: 'secretKey',
        },
        {
            title: '分组',
            dataIndex: 'group',
            key: 'group',
        },
        {
            title: '密钥类型',
            dataIndex: 'secretType',
            key: 'secretType',
            render: (type) => {
                const colorMap = {
                    text: 'blue',
                    password: 'red',
                    cert: 'green',
                    key: 'purple',
                    api_key: 'orange',
                }
                return <Tag color={colorMap[type] || 'default'}>{type}</Tag>
            },
        },
        {
            title: '版本',
            dataIndex: 'keyVersion',
            key: 'keyVersion',
        },
        {
            title: '创建时间',
            dataIndex: 'gmtCreate',
            key: 'gmtCreate',
            render: (time) => time ? new Date(time).toLocaleString() : '-',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    <Button
                        type="link"
                        icon={<EditOutlined/>}
                        onClick={() => navigate(`edit/${record.id}`)}
                    >
                        编辑
                    </Button>
                    <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined/>}
                        onClick={() => handleDelete(record)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <div style={{marginBottom: 16, display: 'flex', justifyContent: 'space-between'}}>
                <h2>密钥管理</h2>
                <Button
                    type="primary"
                    icon={<PlusOutlined/>}
                    onClick={() => navigate('add')}
                >
                    新增密钥
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={{pageSize: 10}}
            />
        </div>
    )
}

export default SecretList
