import React from 'react'
import ReactDOM from 'react-dom/client'
import TenantTag from './TenantTag'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <div style={{padding: 40, display: 'flex', gap: 16}}>
        <TenantTag status="active" tenantCode="T001"/>
        <TenantTag status="suspended" tenantCode="T002"/>
        <TenantTag status="deleted"/>
    </div>
)
