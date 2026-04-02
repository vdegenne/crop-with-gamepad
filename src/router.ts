import {Hash, Router} from '@vdegenne/router'
// import {Page} from './pages/index.js'
import {store} from './store.js'
import {Logger} from '@vdegenne/debug'
import chalk from 'chalk'

export const hash = new Hash<{fspath: string}>()
const logger = new Logger({
	colors: {
		log: chalk.yellow,
	},
})

export const router = new Router(async ({location, parts}) => {
	logger.log('Location has changed')
	await store.updateComplete
	hash.reflectHashToParams()
	if (window.location.host.endsWith('.github.io')) {
		parts = parts.slice(1)
	}
	if (parts.length === 0) {
		store.page = 'main'
	} else {
		store.page = parts[0] as Page
	}

	const params = new URLSearchParams(location.search)
})
