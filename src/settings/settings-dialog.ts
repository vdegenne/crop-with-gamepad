import {type MdDialog} from '@material/web/dialog/dialog.js'
import {withController} from '@snar/lit'
import {customElement} from 'custom-element-decorator'
import {html, LitElement} from 'lit'
import {withStyles} from 'lit-with-styles'
import {query} from 'lit/decorators.js'
import '../card-element.js'
import {FILTER} from '../forms/components/filter.js'
import {SWITCH} from '../forms/components/switch.js'
import {getOcrLanguageList} from '../lang.js'
import {store} from '../store.js'
import {themeStore} from '../styles/themeStore.js'
import styles from './settings-dialog.css?inline'

@customElement({name: 'settings-dialog', inject: true})
@withStyles(styles)
@withController(themeStore)
@withController(store)
export class SettingsDialog extends LitElement {
	@query('md-dialog') dialog!: MdDialog

	render() {
		return html`
			<md-dialog>
				<span slot="headline" class="flex gap-3"
					><md-gb-icon>settings</md-gb-icon>Settings</span
				>

				<div slot="content" class="flex flex-col gap-4">
					<card-element headline="global">
						${SWITCH('Open links in new tab?', store, 'openLinksInNewTab')}
					</card-element>

					<card-element headline="OCR">
						${FILTER(
							'Languages',
							store,
							'ocrActivatedLanguages',
							getOcrLanguageList(),
							{
								elevated: true,
								selection: 'multiple',
								required: true,
							},
						)}
						${SWITCH('Persist OCR language', store, 'persistLang', {
							supportingText: 'Across page refresh',
						})}
						${SWITCH('Switch speech', store, 'ocrSwitchSpeech', {
							supportingText: 'Speak the selected lang when switched',
						})}
					</card-element>
				</div>

				<form id="form" method="dialog"></form>

				<div slot="actions"><md-gb-button form="form">Close</md-gb-button></div>
			</md-dialog>
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
