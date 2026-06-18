import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// ESM 构建配置
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        outDir: 'dist',
        lib: {
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'ZCtcFrontendComponent',
            formats: ['es'],
            fileName: () => `z-ctc-component.es.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', '@yuku123/z-frontend-common'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    '@yuku123/z-frontend-common': 'ZCtcFrontendCommon',
                },
                // 避免自动追加 .js 扩展名
                preserveModules: false,
            },
        },
    },
})
