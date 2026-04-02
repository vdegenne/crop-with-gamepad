import '@material/mwc-top-app-bar'
import {withController} from '@snar/lit'
import {html, type PropertyValues} from 'lit'
import {withStyles} from 'lit-with-styles'
import {customElement} from 'lit/decorators.js'
import {MaterialShellChild} from 'material-shell/MaterialShellChild'
import {store} from '../store.js'
import styles from './app-shell.css?inline'

declare global {
	interface Window {
		app: AppShell
	}
	interface HTMLElementTagNameMap {
		'app-shell': AppShell
	}
}

@customElement('app-shell')
@withStyles(styles)
@withController(store)
export class AppShell extends MaterialShellChild {
	render() {
		return html`<!-- -->
			<page-main ?active=${store.page === 'main'}></page-main>
			<!-- -->`
	}

	protected firstUpdated(_changedProperties: PropertyValues): void {
		const topAppBar = this.renderRoot.querySelector('mwc-top-app-bar')!
		// fix scroll disappearance issue.
		setTimeout(() => (topAppBar as any)?.handleResize(), 1)
		// styles for PWA
		const css = new CSSStyleSheet()
		css.replaceSync(`
			.mdc-top-app-bar__section {
				/* padding-left: 0; */
			}
			.mdc-top-app-bar__title {
				padding-left: 0;
			}
			.mdc-top-app-bar {
				-webkit-app-region: drag;
				app-region: drag;
				background-color: color-mix(in srgb, var(--mdc-theme-primary) 70%, transparent);
				backdrop-filter: blur(8px); /* the blur */
				-webkit-backdrop-filter: blur(8px); /* safari */
			}
			#actions ::slotted(*), #navigation ::slotted(*) {
				-webkit-app-region: no-drag;
				app-region: no-drag;
			}
		`)
		topAppBar?.shadowRoot?.adoptedStyleSheets.push(css)
		if ('windowControlsOverlay' in navigator) {
			// Listen for changes in overlay visibility
			;(<any>navigator.windowControlsOverlay).addEventListener(
				'geometrychange',
				(event: any) => {
					const buttons = this.renderRoot.querySelector<HTMLElement>(
						'[slot="actionItems"]',
					)
					if (!buttons) return
					if (event.visible) {
						buttons.style.paddingTop = `${event.titlebarAreaRect.height}px`
						buttons.style.transform = 'scale(0.8)'
					} else {
						buttons.style.paddingTop = '0'
						buttons.style.transform = 'initial'
					}
				},
			)
		}
	}

	// @confirm({headline: 'Logout', content: 'Are you sure you want to logout?'})
	// private _logout() {
	// 	authManager.logout()
	// }
}

export const app = (window.app = new AppShell())
