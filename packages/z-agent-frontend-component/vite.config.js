import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// 开发模式用 ESM，生产用 lib 模式
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
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'ZAgentFrontendComponent',
            formats: ['es', 'umd'],
            fileName: (format) => `z-agent-frontend-component.${format}.js`,
        },
        rollupOptions: {
            external: [
                'react',
                'react-dom',
                'antd',
                '@ant-design/icons',
                'react-router-dom',
                'react-markdown',
                'remark-gfm',
                '@logicflow/core',
                '@logicflow/extension',
                'echarts',
                'echarts-for-react',
                '@yuku123/z-frontend-common',
                'axios',
            ],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    'react-router-dom': 'ReactRouterDOM',
                    'react-markdown': 'ReactMarkdown',
                    'remark-gfm': 'RemarkGfm',
                    '@logicflow/core': 'LogicFlow',
                    '@logicflow/extension': 'LogicFlowExtension',
                    echarts: 'echarts',
                    'echarts-for-react': 'EChartsReact',
                    '@yuku123/z-frontend-common': 'ZFrontendCommon',
                    axios: 'axios',
                },
            },
        },
    },
})
