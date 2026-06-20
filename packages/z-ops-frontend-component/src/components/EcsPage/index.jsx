/**
 * ECS 管理 (占位页面，后端 API 待开发)
 */
import {Empty} from 'antd'
import {DesktopOutlined} from '@ant-design/icons'

const EcsPage = () => (
    <div style={{padding: 24}}>
        <h2 style={{margin: '0 0 8px', fontSize: 20, fontWeight: 600}}>
            <DesktopOutlined style={{marginRight: 8}}/>ECS 管理
        </h2>
        <p style={{color: '#8a8f98', marginBottom: 24}}>查看与管理云服务器实例</p>
        <div style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: 48}}>
            <Empty description="后端 API 开发中，敬请期待"/>
        </div>
    </div>
)
export default EcsPage
