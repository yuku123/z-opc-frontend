import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import request from '../../utils/request';

const {Option} = Select;

function ApiList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await request.get('/interface/list', {
                params: {pageNum: page, pageSize},
            });
            setData(res.data.records || []);
            setPagination({
                current: page,
                pageSize,
                total: res.data.total || 0,
            });
        } catch (error) {
            message.error('获取数据失败');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTableChange = (pagination) => {
        fetchData(pagination.current, pagination.pageSize);
    };

    const handleAdd = () => {
        setEditingRecord(null);
        form.resetFields();
        form.setFieldsValue({status: 1, deprecated: 0, apiMethod: 'GET', apiVersion: 'v1', authType: 'bearer'});
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await request.delete(`/interface/${id}`);
            message.success('删除成功');
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            if (editingRecord) {
                await request.put(`/interface/${editingRecord.id}`, values);
                message.success('更新成功');
            } else {
                await request.post('/interface', values);
                message.success('创建成功');
            }
            setModalVisible(false);
            fetchData(pagination.current, pagination.pageSize);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
            width: 60,
        },
        {
            title: '应用ID',
            dataIndex: 'appId',
            key: 'appId',
            width: 80,
        },
        {
            title: '接口名称',
            dataIndex: 'apiName',
            key: 'apiName',
        },
        {
            title: '接口路径',
            dataIndex: 'apiPath',
            key: 'apiPath',
        },
        {
            title: '请求方法',
            dataIndex: 'apiMethod',
            key: 'apiMethod',
            render: (method) => {
                const colorMap = {
                    GET: '#52c41a',
                    POST: '#1890ff',
                    PUT: '#faad14',
                    DELETE: '#f5222d',
                };
                return (
                    <span style={{color: colorMap[method] || '#666', fontWeight: 'bold'}}>
            {method}
          </span>
                );
            },
        },
        {
            title: '版本',
            dataIndex: 'apiVersion',
            key: 'apiVersion',
        },
        {
            title: '认证类型',
            dataIndex: 'authType',
            key: 'authType',
            render: (type) => {
                const map = {none: '无', basic: 'Basic', bearer: 'Bearer', oauth2: 'OAuth2'};
                return map[type] || type;
            },
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (status === 1 ? '启用' : '禁用'),
        },
        {
            title: '废弃',
            dataIndex: 'deprecated',
            key: 'deprecated',
            render: (deprecated) => (deprecated === 1 ? '是' : '否'),
        },
        {
            title: '创建时间',
            dataIndex: 'gmtCreate',
            key: 'gmtCreate',
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined/>} onClick={() => handleEdit(record)}>
                        编辑
                    </Button>
                    <Popconfirm title="确定删除?" onConfirm={() => handleDelete(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined/>}>
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{marginBottom: 16}}>
                <Button type="primary" icon={<PlusOutlined/>} onClick={handleAdd}>
                    新增接口
                </Button>
            </div>
            <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                pagination={pagination}
                onChange={handleTableChange}
            />
            <Modal
                title={editingRecord ? '编辑接口' : '新增接口'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={700}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="appId"
                        label="应用ID"
                        rules={[{required: true, message: '请输入应用ID'}]}
                    >
                        <Input type="number" placeholder="请输入应用ID"/>
                    </Form.Item>
                    <Form.Item
                        name="apiName"
                        label="接口名称"
                        rules={[{required: true, message: '请输入接口名称'}]}
                    >
                        <Input placeholder="请输入接口名称"/>
                    </Form.Item>
                    <Form.Item
                        name="apiPath"
                        label="接口路径"
                        rules={[{required: true, message: '请输入接口路径'}]}
                    >
                        <Input placeholder="如: /api/user/list"/>
                    </Form.Item>
                    <Form.Item name="apiMethod" label="请求方法" initialValue="GET">
                        <Select>
                            <Option value="GET">GET</Option>
                            <Option value="POST">POST</Option>
                            <Option value="PUT">PUT</Option>
                            <Option value="DELETE">DELETE</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="apiVersion" label="接口版本" initialValue="v1">
                        <Input placeholder="如: v1"/>
                    </Form.Item>
                    <Form.Item name="authType" label="认证类型" initialValue="bearer">
                        <Select>
                            <Option value="none">无</Option>
                            <Option value="basic">Basic</Option>
                            <Option value="bearer">Bearer</Option>
                            <Option value="oauth2">OAuth2</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="requestParams" label="请求参数(JSON)">
                        <Input.TextArea rows={3} placeholder='如: {"name": "string", "age": "number"}'/>
                    </Form.Item>
                    <Form.Item name="responseParams" label="响应参数(JSON)">
                        <Input.TextArea rows={3} placeholder='如: {"code": "number", "data": "object"}'/>
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={2} placeholder="请输入描述"/>
                    </Form.Item>
                    <Form.Item name="status" label="状态" initialValue={1}>
                        <Select>
                            <Option value={1}>启用</Option>
                            <Option value={0}>禁用</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="deprecated" label="是否废弃" initialValue={0}>
                        <Select>
                            <Option value={0}>否</Option>
                            <Option value={1}>是</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ApiList;