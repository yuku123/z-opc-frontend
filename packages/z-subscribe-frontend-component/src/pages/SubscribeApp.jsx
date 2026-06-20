import {Navigate, Route, Routes} from 'react-router-dom'
import SubscriptionList from './SubscriptionList'
import SubscriptionEdit from './SubscriptionEdit'
import RunHistory from './RunHistory'

/**
 * 订阅中心 (z-subscribe) 路由
 * <ul>
 *   <li>/subscribe -> 列表</li>
 *   <li>/subscribe/new -> 新建</li>
 *   <li>/subscribe/edit/:id -> 编辑</li>
 *   <li>/subscribe/runs -> 运行历史</li>
 * </ul>
 */
export default function SubscribeIndex() {
    return (
        <Routes>
            <Route index element={<Navigate to="list" replace/>}/>
            <Route path="list" element={<SubscriptionList/>}/>
            <Route path="new" element={<SubscriptionEdit/>}/>
            <Route path="edit/:id" element={<SubscriptionEdit/>}/>
            <Route path="runs" element={<RunHistory/>}/>
        </Routes>
    )
}
