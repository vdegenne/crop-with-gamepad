import { type ChipSetElement } from '@mahmoodkhalil/material-web-3-demo/labs/gb/components/chip/chip-set-element.js'
import { type ChipElement } from '@material/web/labs/gb/components/chip/chip-element.js'
import { html } from 'lit'
import { createRef, ref, type Ref } from 'lit/directives/ref.js'
import { DEFAULT_SHARED_OPTIONS, type SharedOptions } from '../options.js'

export const FilterBehavior = {
	ZeroOrMore: 'zero-or-more',
	OneOrMore: 'one-or-more',
	OnlyOne: 'only-one',
} as const
export type FilterBehaviorValue =
	(typeof FilterBehavior)[keyof typeof FilterBehavior]

export interface FilterOptions extends SharedOptions<ChipElement> {
	/**
	 * Chip-set selection mode.
	 *
	 * @default 'multiple'
	 */
	selection: 'single' | 'multiple'

	/**
	 * Whether a selection is required.
	 *
	 * @default true
	 */
	required: boolean

	/**
	 * @default 'string'
	 */
	type: 'string' | 'number'

	/**
	 * @default 'none'
	 */
	sort: 'none' | 'alphabet'

	/**
	 * @default false
	 */
	reverseSort: boolean

	/**
	 * @default false
	 */
	elevated: boolean
}
type StringOrNumber = string | number

export function FILTER<T>(
	label: string,
	host: T,
	key: keyof T,
	choices: string[],
	options?: Partial<FilterOptions>,
) {
	const _options: FilterOptions = {
		...DEFAULT_SHARED_OPTIONS,
		selection: 'multiple',
		required: false,
		type: 'string',
		sort: 'none',
		reverseSort: false,
		elevated: false,
		...(options ?? {}),
	}

	const _choices = choices
		.map((choice, index) => ({ value: choice, index }))
		.sort((a, b) => {
			switch (_options.sort) {
				case 'alphabet':
					return a.value.localeCompare(b.value)
				default:
					return 0
			}
		})

	if (_options.reverseSort) {
		_choices.reverse()
	}

	const chipsetref: Ref<ChipSetElement & { value: string | string[] }> =
		createRef()

	return html`
		<div class="flex items-center gap-4 m-0">
			${label ? html`<div>${label}</div>` : null}
			<md-gb-chip-set
				class="justify-stretch"
				selection="${_options.selection}"
				?required="${_options.required}"
				?autofocus="${_options.autofocus}"
				?disabled="${_options.disabled}"
				${ref(chipsetref)}
				@change="${(event: Event) => {
					if (!_options.required || _options.selection !== 'multiple') return

					const chips = Array.from(
						chipsetref.value!.querySelectorAll('md-gb-chip'),
					) as (HTMLElement & { selected: boolean })[]

					const selected = chips.filter((chip) => chip.selected)

					if (selected.length === 0) {
						;(event.target as HTMLElement & { selected: boolean }).selected =
							true
					}

					const values = chips
						.filter((chip) => chip.selected)
						.map((chip) => chip.getAttribute('value')!)

					const result =
						_options.type === 'string' ? values : values.map(Number)

					const current: StringOrNumber[] = [].concat(
						host[key] as StringOrNumber | StringOrNumber[],
					)

					const next: StringOrNumber[] = result

					const unchanged =
						current.length === next.length &&
						current.every((value) => next.includes(value))

					if (!unchanged) {
						;(host[key] as StringOrNumber | StringOrNumber[]) = result
					}
				}}"
			>
				${_choices.map(
					(choice) => html`
						<md-gb-chip
							type="filter"
							color="${_options.elevated ? 'elevated' : 'initial'}"
							?selected="${[]
								.concat(host[key] as StringOrNumber[])
								.includes(
									_options.type === 'string' ? choice.value : choice.index,
								)}"
							value="${
								_options.type === 'string' ? choice.value : choice.index
							}"
						>
							${choice.value}
						</md-gb-chip>
					`,
				)}
			</md-gb-chip-set>
		</div>
	`
}
