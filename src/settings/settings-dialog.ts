import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/dialog/md-gb-dialog.js'
import type {MdDialog} from '@material/web/all.js'
import '@material/web/chips/chip-set.js'
import '@material/web/chips/filter-chip.js'
import '@material/web/labs/gb/components/button/md-gb-button.js'
// import '@material/web/labs/gb/components/chip/md-gb-chip.js'
// import '@material/web/labs/gb/components/chip/md-gb-chip-set.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/chip/md-gb-chip-set.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/chip/md-gb-chip.js'
import '@material/web/labs/gb/components/list/md-gb-list-item.js'
import '@material/web/labs/gb/components/switch/md-gb-switch.js'
import {withController} from '@snar/lit'
import {customElement} from 'custom-element-decorator'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query} from 'lit/decorators.js'
import '../card-element.js'
import {getOcrLanguageList} from '../lang.js'
import '../material/dialog-patch.js'
import '../material/item-patch.js'
import {store} from '../store.js'
import {renderThemeElements} from '../styles/theme-elements.js'
import {themeStore} from '../styles/themeStore.js'
import styles from './settings-dialog.css?inline'

@customElement({name: 'settings-dialog', inject: true})
@withStyles(styles)
@withController(themeStore)
@withController(store)
export class SettingsDialog extends LitElement {
	@query('md-gb-dialog') dialog!: MdDialog

	render() {
		return html`
			<md-gb-dialog>
				<span slot="headline">Settings</span>

				<div class="flex flex-col gap-4">
					<card-element headline="global">
						${store.F.SWITCH('Open links in new tab?', 'openLinksInNewTab')}
					</card-element>

					<card-element headline="OCR">
						${store.F.FILTER(
							'Languages',
							'ocrActivatedLanguages',
							getOcrLanguageList(),
							{
								elevated: true,
								selection: 'multiple',
								required: true,
							},
						)}
						${store.F.SWITCH('Persist OCR language', 'persistLang', {
							supportingText: 'Across page refresh',
						})}
						${store.F.SWITCH('Switch speech', 'ocrSwitchSpeech', {
							supportingText: 'Speak the selected lang when switched',
						})}
					</card-element>

					<card-element headline="theme">
						${renderThemeElements()}
					</card-element>
				</div>

				<form id="form" method="dialog"></form>

				<md-gb-button slot="actions" form="form">Close</md-gb-button>
			</md-gb-dialog>
		`
	}

	async show() {
		// if (this.dialog.open) {
		// 	const dialogClose = new Promise((resolve) => {
		// 		const resolveCB = () => {
		// 			resolve(null)
		// 			this.dialog.removeEventListener('closed', resolveCB)
		// 		}
		// 		this.dialog.addEventListener('closed', resolveCB)
		// 	})
		// 	this.dialog.close()
		// 	await dialogClose
		// }
		this.dialog.show()
	}

	close(returnValue?: string) {
		this.dialog.close()
	}
}

declare global {
	interface Window {
		settingsDialog: SettingsDialog
	}
	interface HTMLElementTagNameMap {
		'settings-dialog': SettingsDialog
	}
}

export const settingsDialog = (window.settingsDialog = new SettingsDialog())
