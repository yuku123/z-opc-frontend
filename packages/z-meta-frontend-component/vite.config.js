import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Vite lib 模式：把 z-meta-frontend-component 打成 ESM + UMD
export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'z_meta_frontend_component',
            formats: ['es', 'umd'],
            fileName: (format) => `z-meta-frontend-component.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'react-router-dom'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    'react-router-dom': 'ReactRouterDOM',
                },
            },
        },
    },
})
