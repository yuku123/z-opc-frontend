import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

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
            name: 'ZTaskFrontendComponent',
            formats: ['es', 'umd'],
            fileName: (format) => `z-task-component.${format}.js`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'antd'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    antd: 'antd',
                },
            },
        },
    },
})