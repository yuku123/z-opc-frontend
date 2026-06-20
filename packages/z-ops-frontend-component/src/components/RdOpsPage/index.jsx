/**
 * 镜像构建记录
 */
import {useEffect, useState} from 'react'
import {Button, message, Table, Tag} from 'antd'
import {ToolOutlined, ReloadOutlined} from '@ant-design/icons'
import {imageBuildApi} from '../../api'

const RdOpsPage = () => {
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const fetchData = async () => { setLoading(true); try { setData(await imageBuildApi.list() || []) } catch { message.error('加载构建记录失败') } finally { setLoading(false) } }
    useEffect(() => { fetchData() }, [])

    const statusMap = {SUCCESS: {text: '成功', color: 'green'}, FAILED: {text: '失败', color: 'red'}, BUILDING: {text: '构建中', color: 'processing'}}
    const columns = [
        {title: 'ID', dataIndex: 'id', width: 60},
        {title: '镜像名', dataIndex: 'imageName', width: 160},
        {title: '应用名', dataIndex: 'appName', width: 120},
        {title: '分支', dataIndex: 'branch', width: 120},
        {title: '环境', dataIndex: 'env', width: 80},
        {title: '状态', dataIndex: 'status', width: 90, render: v => { const s = statusMap[v] || {text: v, color: 'default'}; return <Tag color={s.color}>{s.text}</Tag> }},
        {title: '镜像版本', dataIndex: 'imageTag', width: 140, ellipsis: true},
        {title: '构建时间', dataIndex: 'createdAt', width: 170},
    ]

    return (
        <div style={{padding: 24}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24}}>
                <div><h2 style={{margin: 0, fontSize: 20, fontWeight: 600}}><ToolOutlined style={{marginRight: 8}}/>镜像构建</h2><span style={{color: '#8a8f98', fontSize: 14}}>镜像构建记录</span></div>
                <Button icon={<ReloadOutlined/>} onClick={fetchData}>刷新</Button>
            </div>
            <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 16}}>
                <Table columns={columns} dataSource={data} loading={loading} rowKey="id" pagination={{pageSize: 10}} locale={{emptyText: '暂无构建记录'}}/>
            </div>
        </div>
    )
}
export default RdOpsPage
