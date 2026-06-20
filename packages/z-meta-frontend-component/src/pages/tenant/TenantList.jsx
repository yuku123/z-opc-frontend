import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import request from '../../utils/request';

const {Option} = Select;

function TenantList() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0});
    const [modalVisible, setModalVisible] = useState(false);
    const [editingRecord, setEditingRecord] = useState(null);
    const [form] = Form.useForm();

    const fetchData = async (page = 1, pageSize = 10) => {
        setLoading(true);
        try {
            const res = await request.get('/tenant/list', {
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
        setModalVisible(true);
    };

    const handleEdit = (record) => {
        setEditingRecord(record);
        form.setFieldsValue(record);
        setModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await request.delete(`/tenant/${id}`);
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
                await request.put(`/tenant/${editingRecord.id}`, values);
                message.success('更新成功');
            } else {
                await request.post('/tenant', values);
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
            title: '租户编码',
            dataIndex: 'tenantCode',
            key: 'tenantCode',
        },
        {
            title: '租户名称',
            dataIndex: 'tenantName',
            key: 'tenantName',
        },
        {
            title: '租户类型',
            dataIndex: 'tenantType',
            key: 'tenantType',
            render: (type) => {
                const map = {system: '系统', enterprise: '企业', personal: '个人'};
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
            title: '描述',
            dataIndex: 'description',
            key: 'description',
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
                    新增租户
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
                title={editingRecord ? '编辑租户' : '新增租户'}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="tenantCode"
                        label="租户编码"
                        rules={[{required: true, message: '请输入租户编码'}]}
                    >
                        <Input placeholder="请输入租户编码"/>
                    </Form.Item>
                    <Form.Item
                        name="tenantName"
                        label="租户名称"
                        rules={[{required: true, message: '请输入租户名称'}]}
                    >
                        <Input placeholder="请输入租户名称"/>
                    </Form.Item>
                    <Form.Item name="tenantType" label="租户类型" initialValue="enterprise">
                        <Select>
                            <Option value="system">系统</Option>
                            <Option value="enterprise">企业</Option>
                            <Option value="personal">个人</Option>
                        </Select>
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

export default TenantList;