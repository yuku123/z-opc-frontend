import {Navigate, Route, Routes} from 'react-router-dom'
import Dashboard from './Dashboard/index'

export default function ScheduleIndex() {
    return (
        <Routes>
            <Route index element={<Navigate to="dashboard" replace/>}/>
            <Route path="dashboard" element={<Dashboard/>}/>
            <Route path="job" element={<div>任务列表</div>}/>
        </Routes>
    )
}
