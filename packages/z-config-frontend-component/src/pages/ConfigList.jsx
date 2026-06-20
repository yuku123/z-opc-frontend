import {useEffect, useState} from 'react'
import {Button, Card, Drawer, Input, message, Modal, Popconfirm, Select, Space, Table, Tabs, Tag, Tooltip} from 'antd'
import {
    DeleteOutlined,
    DiffOutlined,
    EditOutlined,
    HistoryOutlined,
    PlusOutlined,
    ReloadOutlined,
    RollbackOutlined,
    SearchOutlined
} from '@ant-design/icons'
import {useLocation, useNavigate} from 'react-router-dom'
import {configApi} from '@/services/api'

const ConfigList = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0})
    const [searchText, setSearchText] = useState('')
    const [selectedNamespace, setSelectedNamespace] = useState(undefined)
    const [selectedGroup, setSelectedGroup] = useState(undefined)
    const [namespaceList, setNamespaceList] = useState([])
    const [groupList, setGroupList] = useState([])
    const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
    const [historyRecord, setHistoryRecord] = useState(null)
    const [historyList, setHistoryList] = useState([])
    const [historyLoading, setHistoryLoading] = useState(false)
    const [compareVer1, setCompareVer1] = useState(null)
    const [compareVer2, setCompareVer2] = useState(null)
    const [diffContent, setDiffContent] = useState({left: '', right: ''})
    const [diffModalOpen, setDiffModalOpen] = useState(false)

    const fetchNamespaceList = async () => {
        try {
            const [clusters, nsList] = await Promise.all([
                configApi.clusterList().catch(() => []),
                configApi.namespaceList().catch(() => []),
            ])
            const clusterNames = (clusters || []).map(i => ({label: i.name, value: i.name}))
            const configNames = (nsList || []).map(n => ({label: n, value: n}))
            // 合并去重
            const seen = new Set()
            const merged = [...clusterNames, ...configNames].filter(i => {
                if (seen.has(i.value)) return false;
                seen.add(i.value);
                return true
            })
            setNamespaceList(merged.length > 0 ? merged : [{label: '默认命名空间', value: 'DEFAULT_NAMESPACE'}])
            if (merged.length > 0 && !selectedNamespace) setSelectedNamespace(merged[0].value)
        } catch (e) {
            console.error('获取命名空间失败', e)
        }
    }

    const fetchGroupList = async () => {
        try {
            const list = await configApi.groupList()
            setGroupList((list || []).map(item => ({label: item, value: item})))
        } catch (e) {
            console.error('获取Group失败', e)
        }
    }

    const fetchConfigList = async (page = 1, pageSize = 10) => {
        setLoading(true)
        try {
            const result = await configApi.pageConfig({
                current: page,
                size: pageSize,
                search: searchText || undefined,
                nameSpace: selectedNamespace,
                group: selectedGroup,
            })
            if (result && result.records) {
                setData(result.records.map((item, i) => ({key: item.id || i, ...item})))
                setPagination({
                    current: result.current || 1,
                    pageSize: result.size || pageSize,
                    total: result.total || 0
                })
            }
        } catch (error) {
            message.error('获取配置列表失败')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (record) => {
        try {
            await configApi.deleteConfig({nameSpace: record.namespace, group: record.group, dataId: record.dataId})
            message.success('删除成功')
            fetchConfigList(pagination.current, pagination.pageSize)
        } catch (error) {
            message.error('删除失败')
        }
    }

    const handleEdit = (record) => navigate('/config/edit', {state: {config: record}})
    const handleTableChange = (p) => fetchConfigList(p.current, p.pageSize)
    const handleSearch = () => fetchConfigList(1, pagination.pageSize)

    // ===== 变更历史抽屉 =====
    const openHistory = async (record) => {
        setHistoryRecord(record)
        setHistoryDrawerOpen(true)
        setHistoryLoading(true)
        try {
            const res = await configApi.historyPage({
                pageNum: 1,
                pageSize: 50,
                namespace: record.namespace,
                group: record.group,
                search: record.dataId
            })
            setHistoryList((res?.records || []).map((r, i) => ({key: r.id || i, ...r})))
        } catch (e) {
            message.error('加载历史失败')
        } finally {
            setHistoryLoading(false)
        }
    }

    const handleRollback = async (item) => {
        try {
            await configApi.saveConfig({
                namespace: item.namespace,
                dataId: item.dataId,
                group: item.group,
                content: item.content,
                configDesc: `回滚至 ${item.gmtCreate}`
            })
            message.success('回滚成功');
            setHistoryDrawerOpen(false);
            fetchConfigList()
        } catch (e) {
            message.error('回滚失败')
        }
    }

    const handleCompare = () => {
        if (!compareVer1 || !compareVer2) {
            message.warning('请选择两个版本');
            return
        }
        setDiffContent({left: compareVer1.content || '', right: compareVer2.content || ''})
        setDiffModalOpen(true)
    }

    useEffect(() => {
        fetchConfigList();
        fetchNamespaceList();
        fetchGroupList()
    }, [location.key])

    // also re-fetch when namespace list changes (trigger fetch after tabs load)
    useEffect(() => {
        if (namespaceList.length > 0) fetchConfigList()
    }, [selectedNamespace])

    const columns = [
        {title: 'Data ID', dataIndex: 'dataId', key: 'dataId', ellipsis: true},
        {title: 'Group', dataIndex: 'group', key: 'group'},
        {title: '应用名', dataIndex: 'appName', key: 'appName'},
        {
            title: '类型', dataIndex: 'configType', key: 'configType',
            render: (type) => <Tag color="blue">{type || 'TEXT'}</Tag>
        },
        {
            title: '操作', key: 'action', width: 150,
            render: (_, record) => (
                <Space>
                    <Button type="link" size="small" icon={<EditOutlined/>}
                            onClick={() => handleEdit(record)}>编辑</Button>
                    <Button type="link" size="small" icon={<HistoryOutlined/>}
                            onClick={() => openHistory(record)}>历史</Button>
                    <Popconfirm title="确认删除" description={`确定要删除 "${record.dataId}" 吗？`}
                                onConfirm={() => handleDelete(record)} okText="确定" cancelText="取消">
                        <Button type="link" danger size="small" icon={<DeleteOutlined/>}>删除</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Card title="配置列表"
                  extra={<Space><Button icon={<ReloadOutlined/>}
                                        onClick={() => fetchConfigList(pagination.current, pagination.pageSize)}
                                        loading={loading}>刷新</Button>
                      <Button type="primary" icon={<PlusOutlined/>}
                              onClick={() => navigate('/config/edit')}>新建配置</Button></Space>}>
                <div style={{marginBottom: 16}}>
                    <Tabs activeKey={selectedNamespace} onChange={(key) => {
                        setSelectedNamespace(key);
                        fetchConfigList(1, pagination.pageSize)
                    }}
                          items={namespaceList.map(ns => ({key: ns.value, label: ns.label}))}/>
                    <Space size="middle">
                        <Select placeholder="选择Group" style={{width: 200}} value={selectedGroup}
                                onChange={setSelectedGroup} allowClear options={groupList}/>
                        <Input.Search placeholder="搜索 Data ID..." value={searchText}
                                      onChange={(e) => setSearchText(e.target.value)} onSearch={handleSearch}
                                      style={{width: 300}} prefix={<SearchOutlined/>} allowClear/>
                        <Button type="primary" onClick={handleSearch}>搜索</Button>
                    </Space>
                </div>
                <Table columns={columns} dataSource={data}
                       pagination={{...pagination, showSizeChanger: true, showTotal: (t) => `共 ${t} 条`}}
                       loading={loading} onChange={handleTableChange}/>
            </Card>
            {/* 变更历史抽屉 */}
            <Drawer title={`变更历史 - ${historyRecord?.dataId || ''}`} open={historyDrawerOpen}
                    onClose={() => setHistoryDrawerOpen(false)} width={800}>
                <Space style={{marginBottom: 12}}>
                    <Select placeholder="选择版本1" style={{width: 250}}
                            onChange={(id) => setCompareVer1(historyList.find(r => r.id === id))}
                            allowClear value={compareVer1?.id} labelRender={() => compareVer1?.gmtCreate || ''}
                            options={historyList.map(r => ({label: `${r.gmtCreate} (${r.opType})`, value: r.id}))}/>
                    <Select placeholder="选择版本2" style={{width: 250}}
                            onChange={(id) => setCompareVer2(historyList.find(r => r.id === id))}
                            allowClear value={compareVer2?.id} labelRender={() => compareVer2?.gmtCreate || ''}
                            options={historyList.map(r => ({label: `${r.gmtCreate} (${r.opType})`, value: r.id}))}/>
                    <Button icon={<DiffOutlined/>} onClick={handleCompare}>对比</Button>
                </Space>
                <Table columns={[
                    {title: '操作时间', dataIndex: 'gmtCreate', key: 'gmtCreate', width: 160},
                    {
                        title: '操作类型', dataIndex: 'opType', key: 'opType', width: 80,
                        render: (op) => <Tag
                            color={op === '新增' ? 'success' : op === '修改' ? 'processing' : 'red'}>{op}</Tag>
                    },
                    {title: '操作人', dataIndex: 'srcUser', key: 'srcUser', width: 80},
                    {
                        title: '当前内容', key: 'content', ellipsis: true,
                        render: (_, r) => <Tooltip
                            title={<pre style={{margin: 0, maxHeight: 200, overflow: 'auto'}}>{r.content}</pre>}><span
                            style={{cursor: 'pointer'}}>{(r.content || '').substring(0, 60)}</span></Tooltip>
                    },
                    {
                        title: '操作', key: 'action', width: 100,
                        render: (_, r) => <Popconfirm title="确认回滚？" onConfirm={() => handleRollback(r)}><Button
                            type="link" size="small" icon={<RollbackOutlined/>}>回滚</Button></Popconfirm>
                    },
                ]} dataSource={historyList} loading={historyLoading} size="small"
                       pagination={{pageSize: 10, showTotal: t => `共 ${t} 条`}}/>
            </Drawer>
            {/* 版本对比弹窗 */}
            <Modal title="版本对比" open={diffModalOpen} width={900} footer={null}
                   onCancel={() => setDiffModalOpen(false)}>
                <div style={{display: 'flex', gap: 8}}>
                    <pre style={{
                        flex: 1,
                        background: '#f5f5f5',
                        padding: 12,
                        borderRadius: 4,
                        maxHeight: 500,
                        overflow: 'auto',
                        fontSize: 13,
                        margin: 0
                    }}>{diffContent.left}</pre>
                    <pre style={{
                        flex: 1,
                        background: '#fff7e6',
                        padding: 12,
                        borderRadius: 4,
                        maxHeight: 500,
                        overflow: 'auto',
                        fontSize: 13,
                        margin: 0
                    }}>{diffContent.right}</pre>
                </div>
            </Modal>
        </div>
    )
}

export default ConfigList
