import '@material/web/all.js'
import '@material/web/labs/gb/components/all.js'

import {adoptStyles} from '@material/web/labs/gb/styles/adopt-styles.js'
import m3Styles from '@material/web/labs/gb/styles/m3.cssresult.js'
adoptStyles(document, [m3Styles])

export function scan() {
	// prettier-ignore
	const elements = [ 'md-elevated-button', 'md-filled-button', 'md-filled-tonal-button', 'md-outlined-button', 'md-text-button', 'md-checkbox', 'md-assist-chip', 'md-chip-set', 'md-filter-chip', 'md-input-chip', 'md-suggestion-chip', 'md-dialog', 'md-divider', 'md-elevation', 'md-branded-fab', 'md-fab', 'md-filled-field', 'md-outlined-field', 'md-focus-ring', 'md-icon', 'md-filled-icon-button', 'md-filled-tonal-icon-button', 'md-icon-button', 'md-outlined-icon-button', 'md-list', 'md-list-item', 'md-menu', 'md-menu-item', 'md-sub-menu', 'md-circular-progress', 'md-linear-progress', 'md-radio', 'md-ripple', 'md-filled-select', 'md-outlined-select', 'md-select-option', 'md-slider', 'md-switch', 'md-primary-tab', 'md-secondary-tab', 'md-tabs', 'md-filled-text-field', 'md-outlined-text-field', 'md-aria-toggle', 'md-aria-fieldset', 'md-aria-menubar', 'md-aria-menuitem', 'md-aria-menulist', 'md-aria-tab', 'md-aria-tablist', 'md-aria-tabpanel', 'md-badge', 'md-elevated-card', 'md-filled-card', 'md-outlined-card', 'md-item', 'md-navigation-bar', 'md-navigation-drawer-modal', 'md-navigation-drawer', 'md-navigation-tab', 'md-outlined-segmented-button', 'md-outlined-segmented-button-set', 'md-gb-app-bar', 'md-gb-badge', 'md-gb-button', 'md-gb-button-group', 'md-gb-card', 'md-gb-checkbox', 'md-gb-chip', 'md-gb-divider', 'md-gb-fab', 'md-gb-icon-button', 'md-gb-list-item', 'md-gb-list', 'md-gb-menu-group', 'md-gb-menu-item', 'md-gb-menu', 'md-gb-nav-bar-item', 'md-gb-nav-bar', 'md-gb-nav-rail-item', 'md-gb-nav-rail', 'md-gb-radio', 'md-gb-slider', 'md-gb-snackbar', 'md-gb-split-button', 'md-gb-switch', 'md-gb-tab', 'md-gb-tabs', 'md-gb-toolbar', 'md-gb-icon', 'md-gb-dialog' ]

	const loaded = elements.filter((name) => customElements.get(name))
	const missing = elements.filter((name) => !customElements.get(name))

	console.group(
		`Loaded Material elements (${loaded.length}/${elements.length})`,
	)
	console.table(
		loaded.map((name) => {
			const constructor = customElements.get(name)!

			return {
				name,
				constructor: constructor.name,
			}
		}),
	)
	console.groupEnd()

	console.groupCollapsed(
		`Missing elements (${missing.length}/${elements.length})`,
	)
	console.table(missing)
	console.groupEnd()
}

declare global {
	interface Window {
		matscan: typeof scan
	}
}

window.matscan = scan

setTimeout(() => scan(), 1500)
