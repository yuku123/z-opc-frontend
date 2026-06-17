/**
 * 组件库开发调试入口
 */
import React from 'react'
import ReactDOM from 'react-dom/client'
import {StatusTag, UserTable} from './index.js'

const App = () => {
    const users = [
        {id: 1, userName: 'admin', nickName: '管理员', phone: '13800138000', email: 'admin@test.com', status: 1},
        {id: 2, userName: 'test', nickName: '测试', phone: '13900001111', email: 'test@test.com', status: 0},
    ]

    return (
        <div style={{padding: 20}}>
            <h1>CTC 组件库 Dev</h1>
            <h2>StatusTag 示例</h2>
            <StatusTag status={1}/>
            <StatusTag status={0}/>
            <StatusTag status="pending"/>

            <h2>UserTable 示例</h2>
            <UserTable
                dataSource={users}
                loading={false}
                onEdit={(record) => console.log('edit', record)}
                onDelete={(record) => console.log('delete', record)}
            />
        </div>
    )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>)
