import {Navigate, Route, Routes} from 'react-router-dom'
import ProjectList from './ProjectList'
import ProjectCreate from './ProjectCreate'
import ProjectDetail from './ProjectDetail'

/**
 * 项目中心 (立项 + Agent 对话) 路由
 */
export default function ProjectIndex() {
    return (
        <Routes>
            <Route index element={<Navigate to="list" replace/>}/>
            <Route path="list" element={<ProjectList/>}/>
            <Route path="new" element={<ProjectCreate/>}/>
            <Route path=":id" element={<ProjectDetail/>}/>
        </Routes>
    )
}
