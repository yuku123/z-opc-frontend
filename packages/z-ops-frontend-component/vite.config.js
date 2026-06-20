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
            entry: path.resolve(__dirname, 'src/index.js'),
            name: 'ZOpsFrontendComponent',
            formats: ['es', 'umd'],
            fileName: (format) => `z-ops-component.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'axios', 'dayjs'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                    '@ant-design/icons': 'icons',
                    axios: 'axios',
                    dayjs: 'dayjs',
                },
            },
        },
    },
})
