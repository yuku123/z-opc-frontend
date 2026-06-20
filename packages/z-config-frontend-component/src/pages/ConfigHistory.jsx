import {useEffect, useState} from 'react'
import {Button, Card, Input, message, Select, Space, Table, Tag} from 'antd'
import {ReloadOutlined, SearchOutlined} from '@ant-design/icons'
import {configApi} from '@/services/api'

const ConfigHistory = () => {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    const [pagination, setPagination] = useState({current: 1, pageSize: 10, total: 0})
    const [searchText, setSearchText] = useState('')
    const [selectedNamespace, setSelectedNamespace] = useState(undefined)
    const [selectedGroup, setSelectedGroup] = useState(undefined)
    const [namespaceList, setNamespaceList] = useState([])
    const [groupList, setGroupList] = useState([])

    useEffect(() => {
        fetchHistoryList();
        loadFilterOptions()
    }, [])

    const loadFilterOptions = async () => {
        try {
            const r = await configApi.clusterList();
            setNamespaceList((r || []).map(i => ({label: i.name, value: i.name})))
        } catch (e) {
        }
        try {
            const r = await configApi.groupList();
            setGroupList((r || []).map(i => ({label: i, value: i})))
        } catch (e) {
        }
    }

    const fetchHistoryList = async (page = 1, pageSize = 10) => {
        setLoading(true)
        try {
            const result = await configApi.historyPage({
                pageNum: page, pageSize,
                search: searchText || undefined,
                namespace: selectedNamespace,
                group: selectedGroup,
            })
            if (result && result.records) {
                setData(result.records.map((item, i) => ({key: item.id || i, ...item})))
                setPagination({current: result.current || 1, pageSize, total: result.total || 0})
            }
        } catch (e) {
            message.error('获取变更历史失败')
        } finally {
            setLoading(false)
        }
    }

    const columns = [
        {title: 'Data ID', dataIndex: 'dataId', key: 'dataId', ellipsis: true},
        {title: 'Group', dataIndex: 'group', key: 'group'},
        {title: '应用名', dataIndex: 'appName', key: 'appName'},
        {
            title: '操作类型', dataIndex: 'opType', key: 'opType',
            render: (op) => <Tag color={op === '新增' ? 'success' : op === '修改' ? 'blue' : 'red'}>{op}</Tag>
        },
        {title: '操作人', dataIndex: 'srcUser', key: 'srcUser'},
        {title: 'MD5', dataIndex: 'md5', key: 'md5', ellipsis: true},
        {title: '操作时间', dataIndex: 'gmtCreate', key: 'gmtCreate'},
    ]

    return (
        <Card title="变更历史">
            <div style={{marginBottom: 16}}>
                <Space size="middle">
                    <Select placeholder="选择命名空间" style={{width: 200}} value={selectedNamespace}
                            onChange={setSelectedNamespace} allowClear options={namespaceList}/>
                    <Select placeholder="选择Group" style={{width: 200}} value={selectedGroup}
                            onChange={setSelectedGroup} allowClear options={groupList}/>
                    <Input.Search placeholder="搜索 Data ID..." value={searchText}
                                  onChange={e => setSearchText(e.target.value)}
                                  onSearch={() => fetchHistoryList(1, pagination.pageSize)}
                                  style={{width: 300}} prefix={<SearchOutlined/>} allowClear/>
                    <Button type="primary" onClick={() => fetchHistoryList(1, pagination.pageSize)}>搜索</Button>
                    <Button icon={<ReloadOutlined/>}
                            onClick={() => fetchHistoryList(pagination.current, pagination.pageSize)}
                            loading={loading}>刷新</Button>
                </Space>
            </div>
            <Table columns={columns} dataSource={data} loading={loading}
                   pagination={{...pagination, showSizeChanger: true, showTotal: t => `共 ${t} 条`}}
                   onChange={p => fetchHistoryList(p.current, p.pageSize)}/>
        </Card>
    )
}

export default ConfigHistory
