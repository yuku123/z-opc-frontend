import {Navigate, Route, Routes} from 'react-router-dom'
import ProjectList from './ProjectList'
import TaskList from './TaskList'

/**
 * 任务中心 (从 z-opc-main-starter-frontend/src/pages/task/index.jsx 迁入).
 *
 * 路由: /task/project, /task/task (保持与原前端一致, 兼容菜单 key)
 */
export default function TaskApp() {
    return (
        <Routes>
            <Route index element={<Navigate to="project" replace/>}/>
            <Route path="project" element={<ProjectList/>}/>
            <Route path="project/*" element={<ProjectList/>}/>
            <Route path="task" element={<TaskList/>}/>
            <Route path="task/*" element={<TaskList/>}/>
        </Routes>
    )
}
