import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import request from '../../utils/request';

const {Option} = Select;

function AppList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await request.get('/app/list', {
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
        form.setFieldsValue({status: 1, appType: 'web'});
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await request.delete(`/app/${id}`);
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
                await request.put(`/app/${editingRecord.id}`, values);
                message.success('更新成功');
            } else {
                await request.post('/app', values);
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
            width: 80,
        },
        {
            title: '租户ID',
            dataIndex: 'tenantId',
            key: 'tenantId',
            width: 80,
        },
        {
            title: '应用编码',
            dataIndex: 'appCode',
            key: 'appCode',
        },
        {
            title: '应用名称',
            dataIndex: 'appName',
            key: 'appName',
        },
        {
            title: '应用类型',
            dataIndex: 'appType',
            key: 'appType',
            render: (type) => {
                const map = {web: 'Web', api: 'API', mobile: '移动端', miniapp: '小程序'};
                return map[type] || type;
            },
        },
        {
            title: '基础URL',
            dataIndex: 'baseUrl',
            key: 'baseUrl',
        },
        {
            title: '负责人',
            dataIndex: 'owner',
            key: 'owner',
        },
        {
            title: '状态',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (status === 1 ? '启用' : '禁用'),
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
                    新增应用
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
                title={editingRecord ? '编辑应用' : '新增应用'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="tenantId"
                        label="租户ID"
                        rules={[{required: true, message: '请输入租户ID'}]}
                    >
                        <Input type="number" placeholder="请输入租户ID"/>
                    </Form.Item>
                    <Form.Item
                        name="appCode"
                        label="应用编码"
                        rules={[{required: true, message: '请输入应用编码'}]}
                    >
                        <Input placeholder="请输入应用编码"/>
                    </Form.Item>
                    <Form.Item
                        name="appName"
                        label="应用名称"
                        rules={[{required: true, message: '请输入应用名称'}]}
                    >
                        <Input placeholder="请输入应用名称"/>
                    </Form.Item>
                    <Form.Item name="appType" label="应用类型" initialValue="web">
                        <Select>
                            <Option value="web">Web</Option>
                            <Option value="api">API</Option>
                            <Option value="mobile">移动端</Option>
                            <Option value="miniapp">小程序</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="baseUrl" label="基础URL">
                        <Input placeholder="请输入基础URL"/>
                    </Form.Item>
                    <Form.Item name="owner" label="负责人">
                        <Input placeholder="请输入负责人"/>
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <Input.TextArea rows={3} placeholder="请输入描述"/>
                    </Form.Item>
                    <Form.Item name="status" label="状态" initialValue={1}>
                        <Select>
                            <Option value={1}>启用</Option>
                            <Option value={0}>禁用</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default AppList;