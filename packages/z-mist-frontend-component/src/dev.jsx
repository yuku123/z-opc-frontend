import React from 'react'
import ReactDOM from 'react-dom/client'
import SecretValueDisplay from './SecretValueDisplay'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
    <div style={{padding: 40, display: 'flex', flexDirection: 'column', gap: 16}}>
        <SecretValueDisplay value="sk-abc123def456" displayValue="••••••"/>
        <SecretValueDisplay value="password-xyz"/>
    </div>
)
