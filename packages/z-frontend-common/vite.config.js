import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// dev 模式用默认设置（启动 dev server），生产用 lib 模式
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
            name: 'ZFrontendCommon',
            formats: ['es', 'umd'],
            fileName: (format) => `z-frontend-common.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', '@ant-design/pro-components', 'react-router-dom', 'axios', 'dayjs'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    '@ant-design/pro-components': 'ProComponents',
                    'react-router-dom': 'ReactRouterDOM',
                    axios: 'axios',
                    'dayjs': 'dayjs',
                },
            },
        },
    },
})
