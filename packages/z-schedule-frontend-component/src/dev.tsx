import React from 'react'
import ReactDOM from 'react-dom/client'
import CronDisplay from './CronDisplay'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
    <div style={{padding: 40, display: 'flex', flexDirection: 'column', gap: 8}}>
        <CronDisplay cron="0 0 2 * * ?"/>
        <CronDisplay cron="0 0 * * * ?"/>
        <CronDisplay cron="0 0 0/2 * * ?"/>
        <CronDisplay cron="0 30 9 * * MON-FRI"/>
    </div>
)
EOF

echo "✓ z-oss + z-schedule 写好"
echo ""
echo "=== 6 个新包 src 内容总览 ==="
for pkg in z-config-frontend-component z-meta-frontend-component z-mist-frontend-component z-ext-frontend-component z-oss-frontend-component z-schedule-frontend-component; do
  echo "--- $pkg ---"
  ls /Users/zifang/workplace/idea_workplace/z/z-opc-frontend/packages/$pkg/src/
done
