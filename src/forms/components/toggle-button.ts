import { type IconButtonElement } from '@material/web/labs/gb/components/iconbutton/icon-button-element.js'
import { html, TemplateResult } from 'lit'
import { type SharedOptions, DEFAULT_SHARED_OPTIONS } from '../options.js'

export interface ToggleButtonOptions extends SharedOptions<IconButtonElement> {
	icon: string | TemplateResult
	selectedIcon: string | TemplateResult
}
export function TOGGLEBUTTON<T>(
	// label: string,
	host: T,
	key: keyof T,
	options?: Partial<ToggleButtonOptions>,
) {
	const icon = options?.icon ?? 'close'
	const _options: ToggleButtonOptions = {
		...DEFAULT_SHARED_OPTIONS,
		icon,
		selectedIcon: icon === 'close' && !options?.selectedIcon ? 'check' : icon,
		...(options ?? {}),
	}
	return html`
		<md-gb-icon-button
			color="filled"
			toggle
			form=""
			?selected=${host[key]}
			@change=${(event: Event) => {
				const target = event.target as IconButtonElement
				;(<boolean>host[key]) = target.selected
			}}
		>
			${
				typeof _options.icon === 'string'
					? html`<md-gb-icon>${_options.icon}</md-gb-icon>`
					: _options.icon
			}
			<div slot="selected">
				${
					typeof _options.selectedIcon === 'string'
						? html`<md-gb-icon>${_options.selectedIcon}</md-gb-icon>`
						: _options.selectedIcon
				}
			</div>
		</md-gb-icon-button>
	`
}
