import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms/FormBuilder.js'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {availablePages} from './constants.js'
import {Page} from './pages/index.js'
import toast from 'toastit'

const availableOcrLanguages = ['eng+fra', 'jpn', 'grc'] as const
type AvailableOcrLanguages = (typeof availableOcrLanguages)[number]

@saveToLocalStorage('crop-with-gamepad:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() openLinksInNewTab = true

	@state() ocrLanguage: AvailableOcrLanguages = 'eng+fra'
	@state() persistLang = false

	F = new FormBuilder(this)

	protected firstUpdated(_changedProperties: PropertyValues): void {
		if (!this.persistLang) {
			this.ocrLanguage = 'eng+fra'
		}
	}

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

		toast(this.ocrLanguage)
	}

	cycleNextAvailableOcrLanguage() {
		const index = availableOcrLanguages.indexOf(this.ocrLanguage)
		const nextIndex = (index + 1) % availableOcrLanguages.length
		this.ocrLanguage = availableOcrLanguages[nextIndex]!
	}
}

export const store = new AppStore()
