import { type CheckboxElement } from '@material/web/labs/gb/components/checkbox/checkbox-element.js'
import '@material/web/labs/gb/components/switch/md-gb-switch.js'
import { type SwitchElement } from '@material/web/labs/gb/components/switch/switch-element.js'
import { html, type TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

export interface SwitchOptions extends SharedOptions<SwitchElement> {
	/** @default 'button' */
	type: 'text' | 'button'
	/** @default false*/
	checkbox: boolean
	overline: string | undefined
	supportingText: string | undefined
	/** @default 'leading' */
	position: 'leading' | 'trailing'
	/**
	 * When position is set to "trailing"
	 * you can provite a leading content (e.g. an icon)
	 */
	leadingContent: string | TemplateResult | undefined
	trailingSupportingText: string | TemplateResult | undefined
}

export function SWITCH<T>(
	headline: string | TemplateResult,
	host: T,
	key: keyof T,
	options?: Partial<SwitchOptions>,
) {
	const _options: SwitchOptions = {
		...DEFAULT_SHARED_OPTIONS,
		type: 'button',
		checkbox: false,
		overline: undefined,
		supportingText: undefined,
		position: 'leading',
		leadingContent: undefined,
		trailingSupportingText: undefined,
		...options,
	}
	_options.style = {
		'user-select': 'none',
		cursor:
			_options.disabled || _options.type === 'text' ? 'initial' : 'pointer',
		..._options.style,
	}

	return html`
		<md-gb-list-item
			type="${_options.type}"
			@click="${() => {
				if (_options.disabled) {
					return
				}
				if (_options.type === 'button') {
					;(host[key] as boolean) = !host[key]
				}
			}}"
			@change="${(event: Event) => {
				if (_options.type === 'text') {
					const target = event.target as HTMLElement
					if (_options.checkbox && target.nodeName === 'MD-CHECKBOX') {
						const checkbox = target as CheckboxElement
						checkbox.updateComplete.then(
							() => ((host[key] as boolean) = checkbox.checked),
						)
					} else if (!_options.checkbox && target.nodeName === 'MD-SWITCH') {
						const switch_ = target as SwitchElement
						switch_.updateComplete.then(
							() => ((host[key] as boolean) = switch_.selected),
						)
					}
				}
			}}"
			?disabled="${_options.disabled}"
			style="${ifDefined(_options.style ? styleMap(_options.style) : undefined)}"
		>
			${
				_options.position === 'trailing' && _options.leadingContent
					? html`<div slot="leading">${_options.leadingContent}</div>`
					: null
			}
			${
				_options.checkbox
					? html`
							<md-gb-checkbox
								slot="${_options.position === 'leading' ? 'leading' : 'trailing'}"
								?checked="${host[key]}"
								?inert="${_options.type === 'button'}"
								?disabled="${_options.disabled}"
							></md-gb-checkbox>
						`
					: html`
							<md-gb-switch
								slot="${_options.position === 'leading' ? 'leading' : 'trailing'}"
								?selected="${host[key]}"
								?inert="${_options.type === 'button'}"
								?disabled="${_options.disabled}"
							></md-gb-switch>
						`
			}
			${
				_options.overline
					? html`<div slot="overline">${_options.overline}</div>`
					: null
			}
			${headline}
			${
				_options.supportingText
					? html`<div slot="supporting-text">${_options.supportingText}</div>`
					: null
			}
			${
				_options.trailingSupportingText
					? html`<div slot="trailing-text">
							${_options.trailingSupportingText}
						</div>`
					: null
			}
		</md-gb-list-item>
	`
}

export interface CheckboxOptions extends SwitchOptions {}

export function CHECKBOX<T>(
	headline: string | TemplateResult,
	host: T,
	key: keyof T,
	options?: Partial<CheckboxOptions>,
) {
	// const _options: SwitchOptions = {
	// 	...DEFAULT_SHARED_OPTIONS,
	// 	checkbox: true,
	// 	...options,
	// };

	return SWITCH(headline, host, key, { ...options, checkbox: true })
}
