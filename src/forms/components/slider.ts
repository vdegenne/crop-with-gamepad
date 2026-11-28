import { type SliderElement } from '@material/web/labs/gb/components/slider/slider-element.js'
import { Debouncer } from '@vdegenne/debouncer'
import { html, nothing, type TemplateResult } from 'lit'
import { ifDefined } from 'lit/directives/if-defined.js'
import { createRef, ref } from 'lit/directives/ref.js'
import { styleMap } from 'lit/directives/style-map.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

export interface SliderOptions extends SharedOptions<SliderElement> {
	step: number
	min: number
	max: number

	/**
	 * @default xs
	 */
	size: 'xs' | 'md' | 'lg'

	/**
	 * @default undefined
	 */
	iconName: string | undefined

	/*
	 * @default false
	 */
	range: boolean
	/**
	 * @default 'input'
	 */
	eventType: 'input' | 'change'
	/**
	 * For 'input' type event, you can set a debouncer timeout,
	 * to avoid changing the value too much.
	 *
	 * @default 0
	 */
	timeoutMs: number

	/**
	 * @default false
	 */
	ticks: boolean

	/**
	 * @default true
	 */
	labeled: boolean
}

export function SLIDER<T>(
	context: {
		label: string | TemplateResult
		host: T
		key: keyof T
	},
	options?: Partial<SliderOptions>,
) {
	const _options: SliderOptions = {
		...DEFAULT_SHARED_OPTIONS,
		min: 0,
		max: 10,
		step: 1,
		range: false,
		eventType: 'input',
		timeoutMs: 0,
		ticks: false,
		labeled: true,
		size:
			options.iconName && (!options.size || options.size === 'xs')
				? 'md'
				: (options.size ?? 'xs'),
		iconName: undefined,
		...options,
	}

	const sliderRef = createRef<SliderElement>()
	function assignValues() {
		const slider = sliderRef.value!
		if (slider.range) {
			;(context.host[context.key] as [number, number]) = [
				slider.valueStart,
				slider.valueEnd,
			]
		} else {
			;(context.host[context.key] as number) = slider.value
		}
	}
	const assignValuesDebouncer = new Debouncer(
		assignValues,
		_options.timeoutMs,
		{ throwOnCancel: false },
	)
	function eventCallBack(event: Event) {
		if (event.type === _options.eventType) {
			if (event.type === 'input') {
				assignValuesDebouncer.debounce()
			} else {
				assignValues()
			}
		}
	}

	return html`
		<md-gb-slider
			size=${_options.size}
			?disabled=${_options.disabled}
			${ref(sliderRef)}
			class="w-full"
			?ticks=${_options.ticks}
			?labeled=${_options.labeled}
			min=${_options.min}
			max=${_options.max}
			?range=${_options.range}
			value-start=${ifDefined(_options.range ? context.host[context.key][0] : undefined)}
			value-end=${ifDefined(_options.range ? context.host[context.key][1] : undefined)}
			value=${ifDefined(!_options.range ? context.host[context.key] : undefined)}
			step=${_options.step}
			@input=${eventCallBack}
			@change=${eventCallBack}
			style=${ifDefined(_options.style ? styleMap(_options.style) : undefined)}
		>
			${_options.iconName ? html`<md-gb-icon slot="icon">${_options.iconName}</md-gb-icon>` : nothing}
		</md-gb-slider>
	`
}
