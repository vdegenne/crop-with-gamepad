import {defineConfig} from 'vite'
import {materialShell} from 'material-shell/vite.js'
import {materialAll} from 'rollup-plugin-material-all'
import {mdicon2svg} from 'vite-plugin-mdicon2svg'
import {PORT} from './src/server/constants.ts'

/**
 * @type {import('vite').Plugin[]}
 */
const plugins = [
	{
		name: 'ignore-file-change',
		handleHotUpdate({file, server}) {
			// console.log(file);
			if (
				['data.json', 'server.js', 'server.ts'].some((ignore) =>
					file.endsWith(ignore)
				)
			) {
				// Ne rien faire = ne pas déclencher de HMR ni de reload
				return []
			}
		},
	},
]

/** Dev plugins */
if (process.env.NODE_ENV.startsWith('dev')) {
	try {
		const {vscodeUiConnectorPlugin} = await import('vscode-ui-connector')
		plugins.push(
			vscodeUiConnectorPlugin({
				ignoredShadowDoms: ['color-picker', 'color-mode-picker'],
				debug: true,
			})
		)
	} catch {}
}

try {
	const {default: basicSsl} = await import('@vitejs/plugin-basic-ssl')
	plugins.push(basicSsl())
} catch {}

/** Material plugins */
plugins.push(
	materialShell({
		// pathToDefaultMaterialStyleSheet: './src/styles/stylesheets/material.css',
	}),
	materialAll({
		//includeComments: true
	}),
	mdicon2svg({
		variant: 'rounded',
		include: [
			'./src/**/*.ts',
			'./node_modules/@vdegenne/material-color-helpers/lib/elements/**/*.js',
			'./node_modules/@vdegenne/forms/lib/FormBuilder.js',
			'./node_modules/@vdegenne/player/lib/player-dialog.js',
		],
	})
)

if (process.env.NODE_ENV === 'production') {
	try {
		const module = await import('rollup-plugin-minify-template-literals')
		plugins.push(module.minifyTemplateLiterals())
	} catch {}
	try {
		const {minifyHtml} = await import('@vdegenne/rollup-plugin-minify-html')
		plugins.push(minifyHtml())
	} catch {}
	try {
		const {viteSingleFile} = await import('vite-plugin-singlefile')
		plugins.push(
			viteSingleFile({
				useRecommendedBuildConfig: false,
			})
		)
	} catch {}
}

/** PWA plugin */
try {
	const {VitePWA} = await import('vite-plugin-pwa')
	plugins.push(
		VitePWA({
			workbox: {
				maximumFileSizeToCacheInBytes: 100_000_000,
				// globDirectory: 'public',
				// globPatterns: ['data/**/*.json'],
				// globIgnores: ['data/**/exchangeInfo.json'],
			},
			registerType: 'autoUpdate',
			includeAssets: ['**/*.{mp3,png,ico,json,svg,otf,ttf,woff2}'],
			manifest: {
				theme_color: undefined,
				background_color: undefined,
				display_override: ['window-controls-overlay'],
				icons: [
					{
						src: 'pwa-64x64.png',
						sizes: '64x64',
						type: 'image/png',
					},
					{
						src: 'pwa-192x192.png',
						sizes: '192x192',
						type: 'image/png',
					},
					{
						src: 'pwa-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'any',
					},
					{
						src: 'maskable-icon-512x512.png',
						sizes: '512x512',
						type: 'image/png',
						purpose: 'maskable',
					},
				],
			},
		})
	)
} catch {}

/** CONFIG */
export default defineConfig({
	base: './',
	resolve: {
		// preserveSymlinks: true,
	},
	server: {
		port: 46807,
		proxy: {
			// '/api': `http://localhost:${PORT}`,
			// '/data': {
			// 	target: 'http://localhost:5173', // Vite's default dev server address
			// 	changeOrigin: true,
			// 	rewrite: (path) => path.replace(/^\/data/, '/dist/data'),
			// },
		},
		// https: {
		// 	key: fs.readFileSync('./ssl/server.key'),
		// 	cert: fs.readFileSync('./ssl/server.crt'),
		// },
	},
	build: {
		// outDir: 'docs',
		// emptyOutDir: false,
		// assetsInlineLimit: 6000,
		// rollupOptions: {
		// 	input: {
		// 		index: pathlib.resolve(__dirname, 'index.html'),
		// 		print: pathlib.resolve(__dirname, 'print/index.html'),
		// 	},
		// },
	},
	esbuild: {
		legalComments: 'none',
	},
	plugins,
})
