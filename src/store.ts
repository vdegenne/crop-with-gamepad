import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {availablePages} from './constants.js'
import {Page} from './pages/index.js'

// @saveToLocalStorage('crop-with-gamepad:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	F = new FormBuilder(this)

	protected updated(changed: PropertyValues<this>) {
		// const {hash, router} = await import('./router.js')
		if (changed.has('page')) {
			// import('./router.js').then(({router}) => {
			// 	router.hash.$('page', this.page)
			// })
			const page = availablePages.includes(this.page) ? this.page : '404'
			import(`./pages/page-${page}.ts`)
				.then(() => {
					console.log(`Page ${page} loaded.`)
				})
				.catch(() => {})
		}
	}
}

export const store = new AppStore()
