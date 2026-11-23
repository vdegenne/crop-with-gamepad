import {PropertyValues, ReactiveController, state} from '@snar/lit'
import {FormBuilder} from '@vdegenne/forms'
import {speakEnglish} from '@vdegenne/speech'
import {Style} from '@vdegenne/voicevox/core'
import {saveToLocalStorage} from 'snar-save-to-local-storage'
import {availablePages} from './constants.js'
import {
	AvailableOcrLanguages,
	getOcrLanguageList,
	OcrLanguageList,
	ocrLanguages,
} from './lang.js'
import {Page} from './pages/index.js'

@saveToLocalStorage('crop-with-gamepad:store')
export class AppStore extends ReactiveController {
	@state() page: Page = 'main'

	@state() openLinksInNewTab = true

	@state() ocrLanguage: AvailableOcrLanguages = 'japan'
	@state() ocrActivatedLanguages: OcrLanguageList = getOcrLanguageList()

	@state() persistLang = false
	@state() ocrSwitchSpeech = true

	@state() voicevoxVoiceId: Style['id'] = 0

	@state() defaultCropValues: {
		x1: number
		y1: number
		x2: number
		y2: number
	} | null = null

	F = new FormBuilder(this)

	protected firstUpdated(_changedProperties: PropertyValues): void {
		if (!this.persistLang) {
			this.ocrLanguage = 'japan'
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
	}

	cycleNextAvailableOcrLanguage() {
		const index = this.ocrActivatedLanguages.indexOf(this.ocrLanguage)
		const nextIndex = (index + 1) % this.ocrActivatedLanguages.length

		this.ocrLanguage = this.ocrActivatedLanguages[nextIndex]!

		if (store.ocrSwitchSpeech) {
			speakEnglish(ocrLanguages[this.ocrLanguage].fullname)
		}
	}
}

export const store = new AppStore()
