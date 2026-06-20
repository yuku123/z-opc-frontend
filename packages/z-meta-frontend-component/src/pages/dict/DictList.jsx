import React, {useEffect, useState} from 'react';
import {Button, Form, Input, message, Modal, Popconfirm, Select, Space, Table, Tabs} from 'antd';
import {DeleteOutlined, EditOutlined, PlusOutlined} from '@ant-design/icons';
import request from '../../utils/request';

const {Option} = Select;
const {TabPane} = Tabs;

function DictList() {
    // 字典类型状态
    const [dictTypeData, setDictTypeData] = useState([]);
    const [dictTypeLoading, setDictTypeLoading] = useState(false);
    const [dictTypePagination, setDictTypePagination] = useState({current: 1, pageSize: 10, total: 0});
    const [dictTypeModalVisible, setDictTypeModalVisible] = useState(false);
    const [editingDictType, setEditingDictType] = useState(null);
    const [dictTypeForm] = Form.useForm();

    // 字典项状态
    const [dictItemData, setDictItemData] = useState([]);
    const [dictItemLoading, setDictItemLoading] = useState(false);
    const [selectedDictId, setSelectedDictId] = useState(null);
    const [dictItemModalVisible, setDictItemModalVisible] = useState(false);
    const [editingDictItem, setEditingDictItem] = useState(null);
    const [dictItemForm] = Form.useForm();

    // 获取字典类型列表
    const fetchDictType = async (page = 1, pageSize = 10) => {
        setDictTypeLoading(true);
        try {
            const res = await request.get('/dict/type/list', {
                params: {pageNum: page, pageSize},
            });
            setDictTypeData(res.data.records || []);
            setDictTypePagination({
                current: page,
                pageSize,
                total: res.data.total || 0,
            });
        } catch (error) {
            message.error('获取字典类型失败');
        } finally {
            setDictTypeLoading(false);
        }
    };

    // 获取字典项列表
    const fetchDictItem = async (dictId) => {
        if (!dictId) return;
        setDictItemLoading(true);
        setSelectedDictId(dictId);
        try {
            const res = await request.get(`/dict/item/${dictId}`);
            setDictItemData(res.data || []);
        } catch (error) {
            message.error('获取字典项失败');
        } finally {
            setDictItemLoading(false);
        }
    };

    useEffect(() => {
        fetchDictType();
    }, []);

    // 字典类型操作
    const handleDictTypeAdd = () => {
        setEditingDictType(null);
        dictTypeForm.resetFields();
        dictTypeForm.setFieldsValue({status: 1, dictType: 'custom'});
        setDictTypeModalVisible(true);
    };

    const handleDictTypeEdit = (record) => {
        setEditingDictType(record);
        dictTypeForm.setFieldsValue(record);
        setDictTypeModalVisible(true);
    };

    const handleDictTypeDelete = async (id) => {
        try {
            await request.delete(`/dict/type/${id}`);
            message.success('删除成功');
            fetchDictType(dictTypePagination.current, dictTypePagination.pageSize);
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleDictTypeSubmit = async () => {
        try {
            const values = await dictTypeForm.validateFields();
            if (editingDictType) {
                await request.put(`/dict/type/${editingDictType.id}`, values);
                message.success('更新成功');
            } else {
                await request.post('/dict/type', values);
                message.success('创建成功');
            }
            setDictTypeModalVisible(false);
            fetchDictType(dictTypePagination.current, dictTypePagination.pageSize);
        } catch (error) {
            message.error('操作失败');
        }
    };

    // 字典项操作
    const handleDictItemAdd = () => {
        if (!selectedDictId) {
            message.warning('请先选择字典类型');
            return;
        }
        setEditingDictItem(null);
        dictItemForm.resetFields();
        dictItemForm.setFieldsValue({status: 1, dictId: selectedDictId, sortOrder: 0});
        setDictItemModalVisible(true);
    };

    const handleDictItemEdit = (record) => {
        setEditingDictItem(record);
        dictItemForm.setFieldsValue(record);
        setDictItemModalVisible(true);
    };

    const handleDictItemDelete = async (id) => {
        try {
            await request.delete(`/dict/item/${id}`);
            message.success('删除成功');
            fetchDictItem(selectedDictId);
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleDictItemSubmit = async () => {
        try {
            const values = await dictItemForm.validateFields();
            if (editingDictItem) {
                await request.put(`/dict/item/${editingDictItem.id}`, values);
                message.success('更新成功');
            } else {
                await request.post('/dict/item', values);
                message.success('创建成功');
            }
            setDictItemModalVisible(false);
            fetchDictItem(selectedDictId);
        } catch (error) {
            message.error('操作失败');
        }
    };

    const dictTypeColumns = [
        {title: 'ID', dataIndex: 'id', key: 'id', width: 60},
        {title: '字典编码', dataIndex: 'dictCode', key: 'dictCode'},
        {title: '字典名称', dataIndex: 'dictName', key: 'dictName'},
        {title: '字典类型', dataIndex: 'dictType', key: 'dictType', render: (t) => t === 'system' ? '系统' : '自定义'},
        {title: '状态', dataIndex: 'status', key: 'status', render: (s) => s === 1 ? '启用' : '禁用'},
        {title: '描述', dataIndex: 'description', key: 'description'},
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link" onClick={() => fetchDictItem(record.id)}>查看项</Button>
                    <Button type="link" icon={<EditOutlined/>} onClick={() => handleDictTypeEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除?" onConfirm={() => handleDictTypeDelete(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined/>}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const dictItemColumns = [
        {title: 'ID', dataIndex: 'id', key: 'id', width: 60},
        {title: '字典项编码', dataIndex: 'itemCode', key: 'itemCode'},
        {title: '字典项名称', dataIndex: 'itemName', key: 'itemName'},
        {title: '字典项值', dataIndex: 'itemValue', key: 'itemValue'},
        {title: '排序', dataIndex: 'sortOrder', key: 'sortOrder'},
        {title: '状态', dataIndex: 'status', key: 'status', render: (s) => s === 1 ? '启用' : '禁用'},
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined/>} onClick={() => handleDictItemEdit(record)}>编辑</Button>
                    <Popconfirm title="确定删除?" onConfirm={() => handleDictItemDelete(record.id)}>
                        <Button type="link" danger icon={<DeleteOutlined/>}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="字典类型" key="1">
                    <div style={{marginBottom: 16}}>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleDictTypeAdd}>
                            新增字典类型
                        </Button>
                    </div>
                    <Table
                        columns={dictTypeColumns}
                        dataSource={dictTypeData}
                        loading={dictTypeLoading}
                        rowKey="id"
                        pagination={{
                            ...dictTypePagination,
                            onChange: (page, pageSize) => fetchDictType(page, pageSize),
                        }}
                    />
                </TabPane>
                <TabPane tab="字典项" key="2">
                    <div style={{marginBottom: 16}}>
                        <Button type="primary" icon={<PlusOutlined/>} onClick={handleDictItemAdd}>
                            新增字典项
                        </Button>
                        {selectedDictId && <span style={{marginLeft: 16}}>当前字典ID: {selectedDictId}</span>}
                    </div>
                    <Table
                        columns={dictItemColumns}
                        dataSource={dictItemData}
                        loading={dictItemLoading}
                        rowKey="id"
                    />
                </TabPane>
            </Tabs>

            {/* 字典类型弹窗 */}
            <Modal
                title={editingDictType ? '编辑字典类型' : '新增字典类型'}
                open={dictTypeModalVisible}
                onOk={handleDictTypeSubmit}
                onCancel={() => setDictTypeModalVisible(false)}
                width={600}
            >
                <Form form={dictTypeForm} layout="vertical">
                    <Form.Item name="tenantId" label="租户ID" initialValue={1}>
                        <Input type="number" placeholder="请输入租户ID"/>
                    </Form.Item>
                    <Form.Item name="dictCode" label="字典编码" rules={[{required: true}]}>
                        <Input placeholder="请输入字典编码"/>
                    </Form.Item>
                    <Form.Item name="dictName" label="字典名称" rules={[{required: true}]}>
                        <Input placeholder="请输入字典名称"/>
                    </Form.Item>
                    <Form.Item name="dictType" label="字典类型" initialValue="custom">
                        <Select>
                            <Option value="system">系统</Option>
                            <Option value="custom">自定义</Option>
                        </Select>
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
                </Form>
            </Modal>

            {/* 字典项弹窗 */}
            <Modal
                title={editingDictItem ? '编辑字典项' : '新增字典项'}
                open={dictItemModalVisible}
                onOk={handleDictItemSubmit}
                onCancel={() => setDictItemModalVisible(false)}
                width={600}
            >
                <Form form={dictItemForm} layout="vertical">
                    <Form.Item name="dictId" label="字典ID" hidden>
                        <Input/>
                    </Form.Item>
                    <Form.Item name="itemCode" label="字典项编码" rules={[{required: true}]}>
                        <Input placeholder="请输入字典项编码"/>
                    </Form.Item>
                    <Form.Item name="itemName" label="字典项名称" rules={[{required: true}]}>
                        <Input placeholder="请输入字典项名称"/>
                    </Form.Item>
                    <Form.Item name="itemValue" label="字典项值" rules={[{required: true}]}>
                        <Input placeholder="请输入字典项值"/>
                    </Form.Item>
                    <Form.Item name="sortOrder" label="排序">
                        <Input type="number" placeholder="请输入排序"/>
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

export default DictList;