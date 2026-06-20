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
            name: 'ZCtcFrontendComponent',
            formats: ['es', 'umd'],
            fileName: (format) => `z-ctc-component.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', '@ant-design/pro-components', 'dayjs', '@yuku123/z-frontend-common'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    '@ant-design/pro-components': 'ProComponents',
                    'dayjs': 'dayjs',
                    '@yuku123/z-frontend-common': 'ZCtcFrontendCommon',
                },
            },
        },
    },
})
