import {Navigate, Route, Routes} from 'react-router-dom'
import Dashboard from './dashboard/Dashboard'
import ApiList from './api/ApiList'
import AppList from './application/AppList'
import DictList from './dict/DictList'
import TenantList from './tenant/TenantList'

export default function MetaIndex() {
    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="api" element={<ApiList/>}/>
            <Route path="application" element={<AppList/>}/>
            <Route path="dict" element={<DictList/>}/>
            <Route path="tenant" element={<TenantList/>}/>
        </Routes>
    )
}