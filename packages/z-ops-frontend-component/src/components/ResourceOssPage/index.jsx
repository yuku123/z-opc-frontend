/**
 * 对象存储 (OSS Bucket 列表)
 */
import {useEffect, useState} from 'react'
import {Button, message, Space, Table} from 'antd'
import {FolderOpenOutlined, ReloadOutlined} from '@ant-design/icons'
import {ossBucketApi} from '../../api'

const ResourceOssPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const fetchData = async () => { setLoading(true); try { setData(await ossBucketApi.list() || []) } catch { message.error('加载 Bucket 列表失败') } finally { setLoading(false) } }
    useEffect(() => { fetchData() }, [])

    const columns = [
        {title: 'Bucket 名称', dataIndex: 'name', copyable: true},
        {title: '创建时间', dataIndex: 'createdAt', width: 180},
        {title: '存储类型', dataIndex: 'storageClass', width: 100, render: v => v || '标准'},
        {title: '区域', dataIndex: 'region', width: 100},
        {title: '对象数', dataIndex: 'objectCount', width: 100, render: v => v ?? '-'},
        {title: '用量', dataIndex: 'sizeGb', width: 100, render: v => v != null ? `${v} GB` : '-'},
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}><FolderOpenOutlined style={{marginRight: 8}}/>对象存储</h2><span style={{color: '#8a8f98', fontSize: 14}}>OSS Bucket 与文件目录</span></div>
                <Button icon={<ReloadOutlined/>} onClick={fetchData}>刷新</Button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="name" pagination={{pageSize: 10}} locale={{emptyText: '暂无 Bucket'}}/>
            </div>
        </div>
    )
}
export default ResourceOssPage
