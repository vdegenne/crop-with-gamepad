import { type MdFilledTextField } from '@material/web/textfield/filled-text-field.js'
import { type MdOutlinedTextField } from '@material/web/textfield/outlined-text-field.js'
import { html, nothing, type TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { literal, html as staticHtml, StaticValue } from 'lit/static-html.js'
import { bindInput } from '../bindInput.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

type TextField = MdFilledTextField | MdOutlinedTextField

type OnInputParameters = { textfield: TextField; value: string }
type OnInputReturnType = { errorText?: string; supportingText?: string }

export interface TextFieldOptions extends SharedOptions<TextField> {
	// TODO: find a generic type for input type
	type:
		| 'text'
		| 'number'
		| 'textarea'
		| 'date'
		| 'time'
		| 'datetime-local'
		| 'url'
		| 'email'
		| 'password'
	suffixText: string | undefined
	/** @default 'outlined' */
	color: 'filled' | 'outlined'
	/**
	 * Number of rows when the type is "textarea"
	 * @default 2
	 */
	rows: number

	/**
	 * @default false
	 */
	resetButton:
		| {
				icon?: string | TemplateResult
				callback?: (textfield: TextField) => void
		  }
		| boolean
		| undefined

	onInput: ((params: OnInputParameters) => OnInputReturnType) | undefined

	leadingIcon: string | TemplateResult | undefined

	supportingText: string | undefined

	placeholder: string | undefined

	/**
	 * Constrain input max length
	 */
	maxLength: number | undefined

	/**
	 * A timeout used to debounce the input change event.
	 * Useful for a search input to prevent running a resourceful function on each keys.
	 *
	 * @default 0
	 */
	// changeTimeoutMs: number;

	/**
	 * When using type "number" you can set a min value for the input.
	 *
	 * @default ''
	 */
	min: string
	/**
	 * When using type "number" you can set a max value for the input.
	 *
	 * @default ''
	 */
	max: string
}

async function waitElement<T extends HTMLElement = HTMLElement>(
	getElement: () => T,
) {
	return new Promise<T>((resolve) => {
		function check() {
			const tf = getElement()
			if (tf) {
				resolve(tf)
			}
			requestAnimationFrame(check)
		}
		requestAnimationFrame(check)
	})
}
async function registerEvents<T extends HTMLElement = HTMLElement>(
	getElement: () => T,
	events: { init?: (element: T) => void },
) {
	const element = await waitElement(getElement)
	events.init?.(element)
	return element
}

export function TEXTFIELD<T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<TextFieldOptions>,
) {
	const _options: TextFieldOptions = {
		...DEFAULT_SHARED_OPTIONS,
		type: 'text',
		suffixText: undefined,
		color: 'filled',
		rows: 2,
		resetButton: false,
		onInput: undefined,
		leadingIcon: undefined,
		supportingText: undefined,
		placeholder: undefined,
		maxLength: undefined,
		min: '',
		max: '',
		...options,
	}
	const promisesToWait = []
	let tagName: StaticValue
	switch (_options.color) {
		case 'filled':
			tagName = literal`md-filled-text-field`
			break

		case 'outlined':
			tagName = literal`md-outlined-text-field`
			break
	}

	const render = () => {
		const textFieldRef = createRef<TextField>()
		const textfield = () => textFieldRef.value

		registerEvents(textfield, { init: _options.init }).then((textfield) => {
			if (_options.onInput) {
				const { errorText, supportingText } =
					_options.onInput?.({
						textfield,
						value: textfield.value,
					}) ?? {}
				if (errorText) {
					textfield.errorText = errorText
				}
				if (supportingText) {
					textfield.supportingText = supportingText
				}
			}
		})

		const resetButtonOrNot = _options.resetButton
			? html`<md-gb-icon-button
					slot="trailing-icon"
					form=""
					@click="${() => {
						if (
							typeof _options.resetButton === 'object' &&
							_options.resetButton.callback
						) {
							_options.resetButton.callback(textfield())
						} else {
							;(<string>host[key]) = ''
							textfield().focus()
						}
					}}"
				>
					${
						typeof _options.resetButton === 'object' &&
						_options.resetButton.icon
							? typeof _options.resetButton.icon === 'string'
								? html`<md-gb-icon>${_options.resetButton.icon}</md-gb-icon>`
								: _options.resetButton.icon
							: html`
									<svg viewBox="0 96 960 960">
										<path
											d="m249 849-42-42 231-231-231-231 42-42 231 231 231-231 42 42-231 231 231 231-42 42-231-231-231 231Z"
										/>
									</svg>
								`
					}
				</md-gb-icon-button>`
			: null

		return staticHtml`
		<md-gb-text-field
			?disabled="${_options.disabled}"
			${ref(textFieldRef)}
			class="flex-1"
			?autofocus="${_options.autofocus}"
			label="${label.replace(/\*/g, '')}"
			type="${_options.type}"
			min="${_options.min}"
			max="${_options.max}"
			.rows="${_options.rows}"
			?required="${_options.required || label.includes('*')}"
			suffix-text="${ifDefined(_options.suffixText)}"
			supporting-text="${ifDefined(_options.supportingText)}"
			style="${ifDefined(_options.style ? styleMap(_options.style) : undefined)}"
			${bindInput(host, key)}
			placeholder="${ifDefined(_options.placeholder)}"
			maxlength="${_options.maxLength ?? nothing}"
		>
		${
			_options.leadingIcon
				? typeof _options.leadingIcon === 'string'
					? html`<md-gb-icon slot="leading-icon"
							>${_options.leadingIcon}</md-gb-icon
						>`
					: html`<div slot="leading-icon">${_options.leadingIcon}</div>`
				: null
		}
		${resetButtonOrNot}
		</md-gb-text-field>
	`
	}

	// return until(
	// 	(async () => {
	// 		await Promise.all(promisesToWait);
	// 		return render();
	// 	})(),
	// 	'',
	// );
	return render()
}

export function TEXTAREA<T>(
	label: string,
	host: T,
	key: keyof T,
	options?: Partial<TextFieldOptions>,
) {
	return TEXTFIELD(label, host, key, { ...options, type: 'textarea' })
}
