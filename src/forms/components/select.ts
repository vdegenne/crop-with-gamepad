import { type MdFilledSelect } from '@material/web/select/filled-select.js'
import { html } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

// TODO: remove
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/select/md-gb-select-option.js'
import '@mahmoodkhalil/material-web-3-demo/labs/gb/components/select/md-gb-select.js'

export interface SelectOptions extends SharedOptions<MdFilledSelect> {
	/**
	 * @default 'popover'
	 */
	menuPositioning: 'popover' | 'fixed' | 'absolute'

	supportingText: string | undefined

	/**
	 * @default 'string'
	 */
	type: 'string' | 'number'

	/**
	 * @default 'none'
	 */
	sorting: 'none' | 'alphabet'

	displayValues: readonly string[] | undefined
}

export function SELECT<T>(
	label: string,
	host: T,
	key: keyof T,
	choices: readonly string[] = [],
	options?: Partial<SelectOptions>,
) {
	const _options: SelectOptions = {
		...DEFAULT_SHARED_OPTIONS,
		menuPositioning: 'popover',
		supportingText: undefined,
		type: 'string',
		sorting: 'none',
		displayValues: undefined,
		...options,
	}

	const _select = createRef<MdFilledSelect>()

	const _choices: [string, string, number][] = choices.map((item, index) => [
		item,
		_options.displayValues?.[index] ?? item,
		index,
	])

	if (_options.sorting === 'alphabet') {
		_choices.sort(([, a], [, b]) => a.localeCompare(b))
	}

	return html`
		<md-gb-select
			${ref(_select)}
			?disabled="${_options.disabled}"
			quick
			menu-positioning="${_options.menuPositioning}"
			label="${label}"
			@change="${() => {
				const [item, , index] = _choices[_select.value.selectedIndex]

				;(host[key] as string | number) =
					_options.type === 'number' ? index : item
			}}"
			supporting-text="${ifDefined(_options.supportingText)}"
			style="${ifDefined(
				_options.style ? styleMap(_options.style) : undefined,
			)}"
		>
			${_choices.map(
				([item, displayValue, index]) => html`
					<md-gb-select-option
						?selected="${
							_options.type === 'number'
								? host[key] === index
								: host[key] === item
						}"
						value="${item}"
					>
						${displayValue}
					</md-gb-select-option>
				`,
			)}
		</md-gb-select>
	`
}
