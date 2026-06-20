import {Navigate, Route, Routes} from 'react-router-dom'
import SecretList from './secret/SecretList'
import SecretEdit from './secret/SecretEdit'

export default function MistIndex() {
    return (
        <Routes>
            <Route index element={<Navigate to="secret" replace/>}/>
            <Route path="secret" element={<SecretList/>}/>
            <Route path="secret/add" element={<SecretEdit/>}/>
            <Route path="secret/edit/:id" element={<SecretEdit/>}/>
        </Routes>
    )
}
