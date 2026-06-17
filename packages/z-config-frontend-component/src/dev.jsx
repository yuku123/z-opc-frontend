import React from 'react'
import ReactDOM from 'react-dom/client'
import ConfigStatusBadge from './ConfigStatusBadge'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <div style={{padding: 40, display: 'flex', gap: 16}}>
        <ConfigStatusBadge status="DRAFT"/>
        <ConfigStatusBadge status="PUBLISHED"/>
        <ConfigStatusBadge status="DEPRECATED"/>
    </div>
)
