import {cquerySelector} from 'html-vision'
import toast from 'toastit'
import {cropper} from './cropper.js'
import {openSettingsDialog} from './imports.js'
import {store} from './store.js'

const inputNames = ['INPUT', 'TEXTAREA', 'MD-FILLED-TEXT-FIELD']
export function eventIsFromInput(event: Event) {
	return (event.composedPath() as HTMLElement[]).some((el) => {
		return (
			inputNames.includes(el.tagName) || el.hasAttribute?.('contenteditable')
		)
	})
}

window.addEventListener('keypress', async (event: KeyboardEvent) => {
	// console.log(event)

	if (event.altKey || event.ctrlKey) {
		return
	}

	if (eventIsFromInput(event)) {
		return
	}

	const button = cquerySelector(`[key="${event.key}"]`)
	if (button) {
		button?.click()
		return
	}

	switch (event.key) {
		case 'd':
			// ;(await getThemeStore()).toggleMode()
			break
		case 's':
			openSettingsDialog()
			break
		case 'c':
			store.defaultCropValues = {
				x1: cropper.x1,
				y1: cropper.y1,
				x2: cropper.x2,
				y2: cropper.y2,
			}
			toast('Crop values saved')
			break
	}
})
