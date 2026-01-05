import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

import cssInjectedByJs from 'vite-plugin-css-injected-by-js'

export default defineConfig({
	plugins: [react(), cssInjectedByJs()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src'),
		},
	},
	server: {
		host: 'localhost', // Ensures you can access it on your local network
		port: 3000,
		cors: true, // Allows cross-origin requests (useful when embedding on other sites)
		hmr: {
			host: 'localhost',
			protocol: 'ws',
		},
	},
	build: {
		minify: true,
		manifest: true,
        lib: {
			entry: './src/main.tsx',
			name: 'WebflowTemplate',
			fileName: (format) => `main.js`,
			formats: ['umd']
		},
		rollupOptions: {
            // Ensure external dependencies are bundled or handled
			output: {
				// Provide global variables to use in the UMD build
				// for externalized deps
				globals: {
					react: 'React',
					'react-dom': 'ReactDOM'
				}
			},
		},
	},
})
