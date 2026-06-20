import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: isDev ? {} : {
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'src/index.ts'),
            name: 'z_component',
            formats: ['es', 'umd'],
            fileName: (format) => `${path.basename(process.cwd())}.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', '@ant-design/pro-components', 'react-router-dom', 'dayjs', 'echarts', 'echarts-for-react'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    '@ant-design/pro-components': 'ProComponents',
                    'react-router-dom': 'ReactRouterDOM',
                    dayjs: 'dayjs',
                },
            },
        },
    },
})
